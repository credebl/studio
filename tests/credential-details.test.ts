import { describe, expect, it } from 'vitest'
import type { HolderCredential } from '@/features/holder/types'
import { summarizeCredential } from '@/features/holder/credential-details'

const base64Url = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

const credential = (
  raw: Record<string, unknown>,
  format: HolderCredential['format'],
): HolderCredential => ({
  id: 'cred-1',
  format,
  title: 'Credential',
  raw,
})

describe('credential summary', () => {
  it('summarizes an SD-JWT credential from its stored compact form', () => {
    const payload = {
      vct: 'LocalDegreeCredential',
      iss: 'did:key:issuer',
      iat: 1_795_576_510,
      cnf: { kid: 'did:jwk:holder#key-1' },
    }
    const compact = `${base64Url({ alg: 'EdDSA' })}.${base64Url(
      payload,
    )}.signature~${base64Url(['salt', 'degree', 'Bachelor of Testing'])}~`

    const summary = summarizeCredential(
      credential(
        {
          id: 'cred-1',
          createdAt: '2026-11-24T22:00:51.786Z',
          updatedAt: '2026-11-24T22:01:00.000Z',
          multiInstanceState: 'SingleInstanceUnused',
          _tags: {
            alg: 'EdDSA',
            sdAlg: 'sha-256',
            vct: 'LocalDegreeCredential',
          },
          credentialInstances: [{ compactSdJwtVc: compact }],
        },
        'sd-jwt-vc',
      ),
    )

    expect(summary.metadata).toEqual(
      expect.arrayContaining([
        {
          label: 'Credential type',
          value: 'LocalDegreeCredential',
        },
        { label: 'Issuer', value: 'did:key:issuer' },
        { label: 'Holder binding', value: 'did:jwk:holder#key-1' },
        { label: 'Proof algorithm', value: 'EdDSA' },
        { label: 'Disclosure algorithm', value: 'sha-256' },
        { label: 'Stored', value: '2026-11-24 22:00 UTC' },
        { label: 'Updated', value: '2026-11-24 22:01 UTC' },
        { label: 'Wallet state', value: 'SingleInstanceUnused' },
        { label: 'Record ID', value: 'cred-1' },
      ]),
    )
    expect(summary.claims).toEqual([
      { label: 'degree', value: 'Bachelor of Testing' },
    ])
  })

  it('summarizes the embedded W3C credential and its subject claims', () => {
    const summary = summarizeCredential(
      credential(
        {
          id: 'cred-1',
          createdAt: '2026-11-24T22:18:53.679Z',
          _tags: {
            issuerId: 'did:key:issuer',
            types: ['LocalDegreeLdpVc', 'VerifiableCredential'],
            proofTypes: ['Ed25519Signature2018'],
          },
          credentialInstances: [
            {
              credential: {
                type: ['VerifiableCredential', 'LocalDegreeLdpVc'],
                issuer: 'did:key:issuer',
                issuanceDate: '2026-11-24T22:15:08.901Z',
                expirationDate: '2027-11-24T22:15:08.901Z',
                credentialSubject: {
                  degree: 'Bachelor of Testing',
                  recipient: 'Ajay Jadhav',
                  id: 'did:key:subject',
                },
                proof: { type: 'Ed25519Signature2018' },
              },
            },
          ],
        },
        'w3c-vc',
      ),
    )

    expect(summary.metadata).toEqual(
      expect.arrayContaining([
        { label: 'Credential type', value: 'LocalDegreeLdpVc' },
        { label: 'Issuer', value: 'did:key:issuer' },
        { label: 'Issued', value: '2026-11-24 22:15 UTC' },
        { label: 'Expires', value: '2027-11-24 22:15 UTC' },
        { label: 'Proof algorithm', value: 'Ed25519Signature2018' },
        { label: 'Stored', value: '2026-11-24 22:18 UTC' },
      ]),
    )
    expect(summary.claims).toEqual([
      { label: 'degree', value: 'Bachelor of Testing' },
      { label: 'recipient', value: 'Ajay Jadhav' },
    ])
  })

  it('summarizes mDoc metadata from the agent record tags', () => {
    const summary = summarizeCredential(
      credential(
        {
          id: 'cred-1',
          createdAt: '2026-11-24T22:23:15.721Z',
          _tags: {
            alg: 'ES256',
            docType: 'org.iso.18013.5.1.mDL',
            multiInstanceState: 'SingleInstanceUnused',
          },
          credentialInstances: [{ issuerSignedBase64Url: 'ompuYW1lU3BhY2Vz' }],
        },
        'mso_mdoc',
      ),
    )

    expect(summary.metadata).toEqual(
      expect.arrayContaining([
        { label: 'Document type', value: 'org.iso.18013.5.1.mDL' },
        { label: 'Proof algorithm', value: 'ES256' },
        { label: 'Stored', value: '2026-11-24 22:23 UTC' },
      ]),
    )
    expect(summary.claims).toEqual([])
  })
})
