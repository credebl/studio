import {
  buildIssuerFormState,
  buildTemplatePayload,
  buildUpdateIssuerPayload,
  emptyTemplateFormState,
  getErrorMessage,
  getIssuerName,
  getTemplateErrors,
  parseJsonObject,
  templateToFormState,
} from '@/features/oid4vc/utils/lifecycle'
import { describe, expect, it } from 'vitest'

describe('getIssuerName', () => {
  it('prefers the English display name and falls back to the public id', () => {
    expect(
      getIssuerName({
        id: 'issuer-id',
        publicIssuerId: 'public-issuer',
        metadata: [
          { locale: 'de', name: 'Deutsch' },
          { locale: 'en', name: 'English' },
        ],
      }),
    ).toBe('English')
    expect(
      getIssuerName({ id: 'issuer-id', publicIssuerId: 'public-issuer' }),
    ).toBe('public-issuer')
  })
})

describe('buildUpdateIssuerPayload', () => {
  it('builds display data and preserves issuer settings', () => {
    const payload = buildUpdateIssuerPayload({
      name: 'Issuer',
      description: 'Description',
      logoLink: 'https://example.com/logo.svg',
      authorizationServerUrl: 'https://agent.example.com',
      locales: [],
      isPrimary: true,
      batchCredentialIssuanceSize: '25',
    })

    expect(payload.display[0]).toMatchObject({
      locale: 'en',
      name: 'Issuer',
      description: 'Description',
    })
    expect(payload.isPrimary).toBe(true)
    expect(payload.batchCredentialIssuanceSize).toBe(25)
  })

  it('uses a platform-valid batch size when none is provided', () => {
    expect(buildIssuerFormState().batchCredentialIssuanceSize).toBe('1')
    expect(
      buildUpdateIssuerPayload({
        ...buildIssuerFormState(),
        batchCredentialIssuanceSize: '0',
      }).batchCredentialIssuanceSize,
    ).toBe(1)
  })
})

describe('template payload helpers', () => {
  it('builds an SD-JWT template payload from form state', () => {
    const state = emptyTemplateFormState()
    const payload = buildTemplatePayload({
      ...state,
      name: 'Diploma',
      vct: 'DiplomaCredential-sdjwt',
      appearanceName: 'Diploma',
      attributes: [
        {
          key: 'student_name',
          valueType: 'string',
          mandatory: true,
          disclose: true,
          displayName: 'Student name',
        },
      ],
    })

    expect(payload.format).toBe('dc+sd-jwt')
    expect(payload.template).toMatchObject({
      vct: 'DiplomaCredential-sdjwt',
      attributes: [
        {
          key: 'student_name',
          // eslint-disable-next-line camelcase
          value_type: 'string',
          disclose: true,
          display: [{ name: 'Student name', locale: 'en' }],
        },
      ],
    })
    expect(payload.appearance?.display[0].name).toBe('Diploma')
  })

  it('builds an mdoc template payload with namespaces', () => {
    const state = emptyTemplateFormState()
    const payload = buildTemplatePayload({
      ...state,
      name: 'Driving licence',
      format: 'mso_mdoc',
      signerOption: 'X509_P256',
      doctype: 'org.iso.18013.5.1.mDL',
      namespaces: [
        {
          namespace: 'org.iso.18013.5.1',
          attributes: [
            {
              key: 'family_name',
              valueType: 'string',
              mandatory: true,
              disclose: false,
              displayName: 'Family name',
            },
          ],
        },
      ],
    })

    expect(payload.template).toMatchObject({
      doctype: 'org.iso.18013.5.1.mDL',
      namespaces: [
        {
          namespace: 'org.iso.18013.5.1',
          attributes: [{ key: 'family_name' }],
        },
      ],
    })
  })

  it('round-trips an existing template into form state', () => {
    const state = templateToFormState({
      id: 'template-id',
      name: 'Diploma',
      format: 'dc+sd-jwt',
      canBeRevoked: true,
      attributes: {
        vct: 'DiplomaCredential-sdjwt',
        attributes: [
          {
            key: 'student_name',
            // eslint-disable-next-line camelcase
            value_type: 'string',
            disclose: true,
          },
        ],
      },
      appearance: {
        display: [
          { name: 'Diploma', logo: { uri: 'https://example.com/logo.svg' } },
        ],
      },
    })

    expect(state.vct).toBe('DiplomaCredential-sdjwt')
    expect(state.attributes[0].key).toBe('student_name')
    expect(state.canBeRevoked).toBe(true)
    expect(state.appearanceLogo).toBe('https://example.com/logo.svg')
  })

  it('requires a vct and attributes for SD-JWT templates', () => {
    const errors = getTemplateErrors(emptyTemplateFormState())
    expect(errors.name).toBeDefined()
    expect(errors.vct).toBeDefined()
    expect(errors.attributes).toBeDefined()
  })
})

describe('parseJsonObject', () => {
  it('parses JSON objects', () => {
    expect(parseJsonObject('{"name":"Garry"}', 'Payload')).toEqual({
      data: { name: 'Garry' },
    })
  })

  it('rejects invalid JSON and arrays', () => {
    expect(parseJsonObject('{', 'Payload').error).toBe(
      'Payload is not valid JSON',
    )
    expect(parseJsonObject('[]', 'Payload').error).toBe(
      'Payload must be a JSON object',
    )
  })

  it('treats empty input as no value', () => {
    expect(parseJsonObject('  ', 'Payload')).toEqual({})
  })
})

describe('getErrorMessage', () => {
  it('prefers the platform message from an API error response', () => {
    expect(
      getErrorMessage(
        {
          message: 'Request failed with status code 409',
          response: { data: { message: 'This offer can still be used' } },
        },
        'Action failed',
      ),
    ).toBe('This offer can still be used')
  })

  it('joins validation message arrays', () => {
    expect(
      getErrorMessage(
        {
          response: { data: { message: ['Name is required', 'Invalid URL'] } },
        },
        'Action failed',
      ),
    ).toBe('Name is required, Invalid URL')
  })
})
