/* eslint-disable camelcase */
import { describe, expect, it } from 'vitest'
import {
  normalizeHolderCredentials,
  normalizeHolderDids,
  normalizeResolvedOffer,
} from '@/features/holder/normalize'

describe('holder normalization', () => {
  it('accepts plain arrays from the holder list endpoints', () => {
    const credentials = normalizeHolderCredentials(
      [
        {
          id: 'cred-1',
          credential: 'eyJhbGciOi',
          issuer: 'did:web:issuer.example',
        },
      ],
      'sd-jwt-vc',
    )

    expect(credentials).toMatchObject([
      {
        id: 'cred-1',
        format: 'sd-jwt-vc',
        encoded: 'eyJhbGciOi',
        issuer: 'did:web:issuer.example',
      },
    ])
  })

  it('derives credential details from the agent record shape', () => {
    const [credential] = normalizeHolderCredentials(
      [
        {
          id: 'cred-1',
          createdAt: '2026-11-24T22:18:53.679Z',
          _tags: {
            issuerId: 'did:key:issuer',
            types: ['LocalDegreeLdpVc', 'VerifiableCredential'],
          },
          credentialInstances: [
            {
              credential: {
                issuer: 'did:key:issuer',
                issuanceDate: '2026-11-24T22:15:08.901Z',
                type: ['VerifiableCredential', 'LocalDegreeLdpVc'],
              },
            },
          ],
        },
      ],
      'w3c-vc',
    )

    expect(credential).toMatchObject({
      id: 'cred-1',
      title: 'LocalDegreeLdpVc',
      issuer: 'did:key:issuer',
      issuedAt: '2026-11-24T22:18:53.679Z',
    })
  })

  it('accepts the paginated envelope used when query parameters are sent', () => {
    const dids = normalizeHolderDids({
      data: [{ id: 'did-1', did: 'did:key:z6Mk' }],
      pagination: { total: 1 },
    })

    expect(dids).toMatchObject([{ id: 'did-1', did: 'did:key:z6Mk' }])
  })

  it('extracts DID details from the agent record shape', () => {
    const [did] = normalizeHolderDids([
      {
        id: 'record-1',
        did: 'did:key:z6Mk',
        role: 'created',
        createdAt: '2026-11-24T20:49:57.827Z',
        _tags: {
          method: 'key',
          methodSpecificIdentifier: 'z6Mk',
          role: 'created',
        },
        didDocument: {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: 'did:key:z6Mk',
          verificationMethod: [{ type: 'Ed25519VerificationKey2018' }],
          authentication: ['did:key:z6Mk#z6Mk'],
          assertionMethod: ['did:key:z6Mk#z6Mk'],
          keyAgreement: [{ id: 'did:key:z6Mk#z6LS' }],
        },
      },
    ])

    expect(did).toMatchObject({
      id: 'record-1',
      did: 'did:key:z6Mk',
      method: 'key',
      methodSpecificIdentifier: 'z6Mk',
      keyType: 'Ed25519',
      role: 'created',
      createdAt: '2026-11-24T20:49:57.827Z',
      verificationMethodCount: 1,
      authenticationCount: 1,
      assertionMethodCount: 1,
      keyAgreementCount: 1,
      didDocument: {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: 'did:key:z6Mk',
      },
    })
  })

  it('extracts credential configuration ids from a resolved offer', () => {
    const offer = normalizeResolvedOffer({
      credentialConfigurationsSupported: {
        Degree: { format: 'dc+sd-jwt' },
        IdCard: { format: 'mso_mdoc' },
      },
    })

    expect(offer.configurations.map((item) => item.id)).toEqual([
      'Degree',
      'IdCard',
    ])
  })

  it('only offers the configurations present in the offer payload', () => {
    const offer = normalizeResolvedOffer({
      credentialOfferPayload: {
        credential_configuration_ids: ['Local Degree-sdjwt'],
      },
      credentialIssuerMetadata: {
        credential_configurations_supported: {
          'Local Degree-sdjwt': { format: 'dc+sd-jwt' },
          'Local Degree-mdoc': { format: 'mso_mdoc' },
          'Local Degree-w3c': { format: 'jwt_vc_json' },
        },
      },
    })

    expect(offer.configurations.map((item) => item.id)).toEqual([
      'Local Degree-sdjwt',
    ])
  })

  it('reads offered ids from a nested credential_offer payload', () => {
    const offer = normalizeResolvedOffer({
      credentialOfferPayload: {
        credential_offer: {
          credential_configuration_ids: ['Local Degree-sdjwt'],
        },
      },
      credential_configurations_supported: {
        'Local Degree-sdjwt': { format: 'dc+sd-jwt' },
        'Local Degree-mdoc': { format: 'mso_mdoc' },
      },
    })

    expect(offer.configurations.map((item) => item.id)).toEqual([
      'Local Degree-sdjwt',
    ])
  })
})
