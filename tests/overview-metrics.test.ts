import {
  type HolderOverviewSources,
  buildHolderOverviewMetrics,
} from '@/features/holder/overview-metrics'
import { describe, expect, it } from 'vitest'
import type { HolderCredential } from '@/features/holder/types'

const base64Url = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

const ISSUED_AT = 1_795_000_000
const TEN_DAYS = 10 * 24 * 60 * 60
const FORTY_FIVE_DAYS = 45 * 24 * 60 * 60

const sdJwtCredential = (
  id: string,
  kid: string,
  expiresAt: number,
  storedAt: string,
): HolderCredential => {
  const payload = {
    vct: 'LocalDegreeCredential',
    iss: 'did:key:issuer',
    iat: 1_795_000_000,
    exp: expiresAt,
    cnf: { kid },
  }
  const compact = `${base64Url({ alg: 'EdDSA' })}.${base64Url(payload)}.signature~`
  return {
    id,
    format: 'sd-jwt-vc',
    title: 'SD-JWT credential',
    raw: {
      id,
      createdAt: storedAt,
      _tags: { alg: 'EdDSA', sdAlg: 'sha-256', vct: payload.vct },
      credentialInstances: [{ compactSdJwtVc: compact }],
    },
  }
}

const w3cCredential = (id: string, expiresAt: string): HolderCredential => ({
  id,
  format: 'w3c-vc',
  title: 'Credential',
  raw: {
    id,
    createdAt: '2026-11-20T10:00:00.000Z',
    _tags: { issuerId: 'did:key:issuer', types: ['LocalDegreeLdpVc'] },
    credentialInstances: [
      {
        credential: {
          type: ['VerifiableCredential', 'LocalDegreeLdpVc'],
          issuer: 'did:key:issuer',
          issuanceDate: '2026-11-20T09:00:00.000Z',
          expirationDate: expiresAt,
          proof: {
            type: 'Ed25519Signature2018',
            verificationMethod: 'did:key:primary#key-1',
          },
        },
      },
    ],
  },
})

const sources = (): HolderOverviewSources => ({
  dids: [
    {
      id: 'did-1',
      did: 'did:key:primary',
      method: 'key',
      keyType: 'Ed25519',
      isPrimary: true,
      createdAt: '2026-11-19T10:00:00.000Z',
      raw: {},
    },
    {
      id: 'did-2',
      did: 'did:web:holder.example',
      method: 'web',
      keyType: 'Ed25519',
      createdAt: '2026-11-18T10:00:00.000Z',
      raw: {},
    },
  ],
  credentials: {
    'sd-jwt-vc': [
      sdJwtCredential(
        'sd-1',
        'did:jwk:eyJrZHkiOiJlZDI1NTE5In0#key-1',
        ISSUED_AT + TEN_DAYS,
        '2026-11-24T10:00:00.000Z',
      ),
      sdJwtCredential(
        'sd-2',
        'did:key:shared#key-1',
        ISSUED_AT + FORTY_FIVE_DAYS,
        '2026-11-23T10:00:00.000Z',
      ),
      sdJwtCredential(
        'sd-3',
        'did:key:shared#key-1',
        1_795_000_000 - 60,
        '2026-11-22T10:00:00.000Z',
      ),
    ],
    // eslint-disable-next-line camelcase
    mso_mdoc: [
      {
        id: 'mdoc-1',
        format: 'mso_mdoc',
        title: 'mDL',
        raw: {
          id: 'mdoc-1',
          createdAt: '2026-11-21T10:00:00.000Z',
          _tags: { docType: 'org.iso.18013.5.1.mDL' },
        },
      },
    ],
    'w3c-vc': [w3cCredential('w3c-1', '2026-12-20T10:00:00.000Z')],
  },
  credentialAvailability: {
    'sd-jwt-vc': true,
    // eslint-disable-next-line camelcase
    mso_mdoc: true,
    'w3c-vc': true,
  },
  proofs: [
    {
      id: 'proof-1',
      state: 'requestReceived',
      raw: { createdAt: '2026-11-25T10:00:00.000Z' },
    },
    {
      id: 'proof-2',
      state: 'done',
      raw: { createdAt: '2026-11-17T10:00:00.000Z' },
    },
  ],
  proofsAvailable: true,
  connections: [
    { id: 'conn-1', label: 'Alice', state: 'connected', raw: {} },
    { id: 'conn-2', label: 'Bob', state: 'invitationSent', raw: {} },
    { id: 'conn-3', label: 'Carol', state: 'requestReceived', raw: {} },
    { id: 'conn-4', label: 'Dave', state: 'unknown', raw: {} },
  ],
  connectionsAvailable: true,
})

const now = new Date('2026-11-26T00:00:00.000Z')

describe('holder overview metrics', () => {
  it('counts credentials, pending proofs, connections and DID methods', () => {
    const metrics = buildHolderOverviewMetrics(sources(), now)

    expect(metrics.credentials.total).toBe(5)
    expect(metrics.credentials.byFormat).toEqual([
      { format: 'sd-jwt-vc', label: 'SD-JWT', count: 3 },
      { format: 'mso_mdoc', label: 'mDoc', count: 1 },
      { format: 'w3c-vc', label: 'W3C VC', count: 1 },
    ])
    expect(metrics.proofs).toEqual({ pending: 1, total: 2 })
    expect(metrics.connections).toEqual({
      total: 4,
      connected: 1,
      invited: 1,
      requested: 1,
      other: 1,
    })
    expect(metrics.dids).toMatchObject({
      total: 2,
      primaryDid: 'did:key:primary',
      byMethod: [
        { label: 'key', count: 1 },
        { label: 'web', count: 1 },
      ],
      keyTypes: [{ label: 'Ed25519', count: 2 }],
    })
  })

  it('reports credential health without exposing credential values', () => {
    const metrics = buildHolderOverviewMetrics(sources(), now)

    expect(metrics.health).toEqual({
      total: 5,
      distinctIssuers: 1,
      expiring: 2,
      expired: 1,
      noExpiry: 1,
    })
    expect(JSON.stringify(metrics)).not.toContain('compactSdJwtVc')
  })

  it('classifies fresh keys, stored DIDs and identifier reuse', () => {
    const metrics = buildHolderOverviewMetrics(sources(), now)

    expect(metrics.binding).toEqual({
      detected: 4,
      freshKey: 1,
      storedDid: 3,
      sharedCredentials: 2,
      primaryReuse: 1,
      undetected: 1,
    })
  })

  it('sorts recent activity and flags unavailable sources', () => {
    const input = sources()
    input.credentialAvailability['w3c-vc'] = false
    input.proofsAvailable = false
    const metrics = buildHolderOverviewMetrics(input, now)

    expect(metrics.activity.map((item) => item.label)).toEqual([
      'Proof request',
      'Credential stored',
      'Credential stored',
      'Credential stored',
      'Credential stored',
    ])
    expect(metrics.activity[0]).toMatchObject({
      href: '/holder/proofs',
      detail: 'requestReceived',
      at: '2026-11-25 10:00 UTC',
    })
    expect(metrics.unavailable).toEqual([
      'W3C VC credentials',
      'Proof requests',
    ])
    expect(metrics.credentials.partial).toBe(true)
  })
})
