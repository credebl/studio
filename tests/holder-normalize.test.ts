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
