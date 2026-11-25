/* eslint-disable camelcase -- OID4VC wire metadata uses snake_case field names */
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getHolderDidUrls,
  getPrimaryDidUrl,
  requestCredential,
  resolveCredentialOffer,
} from '@/lib/server/holder'
import { jsonResponse, makeSession } from './helpers'
import { getServerSession } from 'next-auth/next'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    cache: <T>(callback: T): T => callback,
  }
})

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }))
vi.mock('@/utils/authOptions', () => ({ authOptions: {} }))
vi.mock('@/app/api/server/encryption', () => ({
  passwordEncryption: (value: string): string => `encrypted:${value}`,
}))

let fetchMock: Mock<typeof fetch> = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getServerSession).mockResolvedValue(makeSession())
})

const sessionTokens = (): Response =>
  jsonResponse({
    data: { sessionToken: 'access-token', refreshToken: 'refresh-token' },
  })

const lastRequestBody = (): Record<string, unknown> => {
  const call = fetchMock.mock.calls.at(-1)
  return JSON.parse(String(call?.[1]?.body)) as Record<string, unknown>
}

const lastRequestUrl = (): string => String(fetchMock.mock.calls.at(-1)?.[0])

describe('requestCredential forwarding', () => {
  it('forwards the binding object unchanged and never sends a flat DID', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: {} }))

    await expect(
      requestCredential({
        credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
        credentialsToRequest: ['person-sdjwt'],
        binding: {
          mode: 'new-key',
          didMethod: 'did:jwk',
          signatureAlgorithm: 'EdDSA',
        },
        sendNotification: true,
      }),
    ).resolves.toMatchObject({ message: expect.any(String) })

    const body = lastRequestBody()
    expect(body.binding).toEqual({
      mode: 'new-key',
      didMethod: 'did:jwk',
      signatureAlgorithm: 'EdDSA',
    })
    expect(body).not.toHaveProperty('holderDidUrl')
    expect(lastRequestUrl()).toBe(
      'http://platform.test/oid4vc/holder/request-credential',
    )
  })

  it('keeps the flat holderDidUrl form backward compatible', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: {} }))

    await requestCredential({
      credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
      credentialsToRequest: ['person-sdjwt'],
      holderDidUrl: 'did:web:holder.example.com#key-1',
      bindingPolicy: 'prefer',
    })

    const body = lastRequestBody()
    expect(body.holderDidUrl).toBe('did:web:holder.example.com#key-1')
    expect(body.bindingPolicy).toBe('prefer')
    expect(body).not.toHaveProperty('binding')
  })

  it('rejects conflicting forms before any token is redeemed', async () => {
    await expect(
      requestCredential({
        credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
        credentialsToRequest: ['person-sdjwt'],
        holderDidUrl: 'did:key:z6Mkflat',
        binding: {
          mode: 'existing-did',
          holderDidUrl: 'did:web:holder.example.com#key-1',
        },
      }),
    ).rejects.toMatchObject({ code: 'CONFLICTING_HOLDER_DID_URL' })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps upstream validation errors to a stable code without leaking the body', async () => {
    fetchMock.mockResolvedValueOnce(sessionTokens()).mockResolvedValueOnce(
      jsonResponse(
        {
          errorCode: 'UNSUPPORTED_PROOF_ALGORITHM',
          message: 'secret upstream detail: txCode=1234',
        },
        400,
      ),
    )

    await expect(
      requestCredential({
        credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
        credentialsToRequest: ['person-sdjwt'],
        binding: { mode: 'new-key', signatureAlgorithm: 'PS256' },
      }),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_PROOF_ALGORITHM',
      status: 400,
      message: 'Unable to request the credential',
    })
  })
})

describe('holder UI data access', () => {
  it('resolves an offer and normalizes binding metadata', async () => {
    fetchMock.mockResolvedValueOnce(sessionTokens()).mockResolvedValueOnce(
      jsonResponse({
        data: {
          credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
          credentialConfigurationIds: ['person-sdjwt'],
          userPin: '1234',
          issuerMetadata: {
            credentialConfigurationsSupported: {
              'person-sdjwt': {
                format: 'dc+sd-jwt',
                cryptographic_binding_methods_supported: ['did:jwk'],
                proof_types_supported: {
                  jwt: {
                    proof_signing_alg_values_supported: ['EdDSA'],
                  },
                },
              },
            },
          },
        },
      }),
    )

    const offer = await resolveCredentialOffer('openid-credential-offer://?x')

    expect(offer.credentialsToRequest).toEqual(['person-sdjwt'])
    expect(offer.txCode).toBe('1234')
    expect(
      offer.issuerMetadata?.credentialConfigurationsSupported?.['person-sdjwt']
        ?.format,
    ).toBe('dc+sd-jwt')
  })

  it('returns no primary DID when the preference is absent', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'user-1' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(getPrimaryDidUrl('org-1')).resolves.toBeNull()
    expect(lastRequestUrl()).toContain(
      '/orgs/org-1/users/user-1/oid4vc/holder/primary-did',
    )
  })

  it('returns a saved primary DID as a suggestion only', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'user-1' } }))
      .mockResolvedValueOnce(
        jsonResponse({ data: { didUrl: 'did:web:holder.example.com#key-1' } }),
      )

    await expect(getPrimaryDidUrl('org-1')).resolves.toBe(
      'did:web:holder.example.com#key-1',
    )
  })

  it('returns holder DIDs as a bounded normalized list', async () => {
    fetchMock.mockResolvedValueOnce(sessionTokens()).mockResolvedValueOnce(
      jsonResponse({
        data: {
          dids: [
            { did: 'did:key:z6Mk1' },
            { didUrl: 'did:web:holder.example.com' },
            { id: 'not-a-did' },
          ],
        },
      }),
    )

    await expect(getHolderDidUrls('org-1')).resolves.toEqual([
      'did:key:z6Mk1',
      'did:web:holder.example.com',
    ])
  })

  it('does not retry an expired session indefinitely', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401))

    await expect(
      resolveCredentialOffer('openid-credential-offer://?x'),
    ).rejects.toMatchObject({
      status: 401,
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
