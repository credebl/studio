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
})
