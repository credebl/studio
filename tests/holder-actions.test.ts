import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDidAction,
  createDidImportSessionAction,
  createWalletAction,
  requestCredentialAction,
} from '@/app/holder/actions'
import {
  createHolderDid,
  createHolderDidImportSession,
  createHolderWallet,
  getHolderSession,
  requestHolderCredential,
} from '@/lib/server/holder'
import { makeSession } from './helpers'
import { revalidatePath } from 'next/cache'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/server/holder', () => ({
  acceptHolderOffer: vi.fn(),
  acceptHolderProof: vi.fn(),
  acceptProofRequest: vi.fn(),
  authorizationRequest: vi.fn(),
  createHolderConnection: vi.fn(),
  createHolderDid: vi.fn(),
  createHolderDidImportSession: vi.fn(),
  createHolderWallet: vi.fn(),
  decodeHolderMdoc: vi.fn(),
  decodeHolderSdJwt: vi.fn(),
  deleteHolderCredential: vi.fn(),
  getHolderSession: vi.fn(),
  receiveHolderInvitation: vi.fn(),
  requestHolderCredential: vi.fn(),
  resolveCredentialOffer: vi.fn(),
  resolveProofRequest: vi.fn(),
}))

const formData = (values: Record<string, string>): FormData => {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value)
  }
  return data
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getHolderSession).mockResolvedValue(makeSession())
})

describe('holder server actions', () => {
  it('refuses actions without a live holder session', async () => {
    vi.mocked(getHolderSession).mockResolvedValue(null)

    const result = await createWalletAction(null, formData({ label: 'Wallet' }))

    expect(result).toMatchObject({ status: 'error' })
    expect(createHolderWallet).not.toHaveBeenCalled()
  })

  it('creates a wallet without sending an orgId', async () => {
    vi.mocked(createHolderWallet).mockResolvedValue({ id: 'wallet-1' })

    const result = await createWalletAction(
      null,
      formData({
        label: 'My wallet',
        connectionImageUrl: 'https://img.test/a.png',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(createHolderWallet).toHaveBeenCalledWith(
      'My wallet',
      'https://img.test/a.png',
    )
    expect(revalidatePath).toHaveBeenCalledWith('/holder')
  })

  it('rejects did:web without a domain before calling the API', async () => {
    const result = await createDidAction(
      null,
      formData({ method: 'web', keyType: 'ed25519' }),
    )

    expect(result).toMatchObject({ status: 'error' })
    expect(createHolderDid).not.toHaveBeenCalled()
  })

  it('creates did:key with a fresh server-generated seed and no domain', async () => {
    vi.mocked(createHolderDid).mockResolvedValue({ did: 'did:key:z6Mk' })

    const result = await createDidAction(
      null,
      formData({
        method: 'key',
        keyType: 'ed25519',
        domain: 'ignored.example.com',
        network: 'bcovrin:testnet',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    const payload = vi.mocked(createHolderDid).mock.calls.at(-1)?.[0]
    expect(payload).toMatchObject({ method: 'key', keyType: 'ed25519' })
    expect(payload).not.toHaveProperty('domain')
    expect(payload).not.toHaveProperty('network')
    expect(payload).not.toHaveProperty('orgId')
    expect(String(payload?.seed)).toMatch(/^[0-9a-f]{32}$/)
  })

  it('does not reuse a seed across DID creations', async () => {
    vi.mocked(createHolderDid).mockResolvedValue({ did: 'did:key:z6Mk' })

    await createDidAction(null, formData({ method: 'key', keyType: 'ed25519' }))
    await createDidAction(null, formData({ method: 'key', keyType: 'ed25519' }))

    const calls = vi.mocked(createHolderDid).mock.calls.slice(-2)
    expect(calls[0]?.[0].seed).not.toBe(calls[1]?.[0].seed)
  })

  it('creates did:web with the domain and a server-generated seed', async () => {
    vi.mocked(createHolderDid).mockResolvedValue({ did: 'did:web:example.com' })

    const result = await createDidAction(
      null,
      formData({ method: 'web', keyType: 'ed25519', domain: 'example.com' }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(vi.mocked(createHolderDid)).toHaveBeenCalledWith({
      method: 'web',
      keyType: 'ed25519',
      domain: 'example.com',
      seed: expect.stringMatching(/^[0-9a-f]{32}$/),
    })
  })

  it('rejects unsupported DID methods and key types', async () => {
    const polygon = await createDidAction(
      null,
      formData({ method: 'polygon', keyType: 'ed25519' }),
    )
    const rsa = await createDidAction(
      null,
      formData({ method: 'key', keyType: 'rsa' }),
    )

    expect(polygon).toMatchObject({ status: 'error' })
    expect(rsa).toMatchObject({ status: 'error' })
    expect(createHolderDid).not.toHaveBeenCalled()
  })

  it('rejects did:web domains with a scheme or path', async () => {
    const result = await createDidAction(
      null,
      formData({
        method: 'web',
        keyType: 'ed25519',
        domain: 'https://example.com/path',
      }),
    )

    expect(result).toMatchObject({ status: 'error' })
    expect(createHolderDid).not.toHaveBeenCalled()
  })

  it('creates did:key from an imported key without generating a seed', async () => {
    vi.mocked(createHolderDid).mockResolvedValue({ did: 'did:key:z6Mk' })

    const result = await createDidAction(
      null,
      formData({
        method: 'key',
        keyType: 'ed25519',
        encryptedKeySessionId: 'session-1',
        encryptedKeyJwe: 'header.key.iv.ciphertext.tag',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(createHolderDid).toHaveBeenCalledWith({
      method: 'key',
      keyType: 'ed25519',
      encryptedKey: {
        sessionId: 'session-1',
        jwe: 'header.key.iv.ciphertext.tag',
      },
    })
  })

  it('creates did:web with an imported key and the domain', async () => {
    vi.mocked(createHolderDid).mockResolvedValue({ did: 'did:web:example.com' })

    await createDidAction(
      null,
      formData({
        method: 'web',
        keyType: 'ed25519',
        domain: 'example.com',
        encryptedKeySessionId: 'session-1',
        encryptedKeyJwe: 'a.b.c.d.e',
      }),
    )

    expect(createHolderDid).toHaveBeenCalledWith({
      method: 'web',
      keyType: 'ed25519',
      domain: 'example.com',
      encryptedKey: { sessionId: 'session-1', jwe: 'a.b.c.d.e' },
    })
  })

  it('creates did:polygon with a network and an imported key', async () => {
    vi.mocked(createHolderDid).mockResolvedValue({ did: 'did:polygon:0x1' })

    const result = await createDidAction(
      null,
      formData({
        method: 'polygon',
        keyType: 'ed25519',
        network: 'polygon:testnet',
        encryptedKeySessionId: 'session-1',
        encryptedKeyJwe: 'a.b.c.d.e',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(createHolderDid).toHaveBeenCalledWith({
      method: 'polygon',
      keyType: 'ed25519',
      network: 'polygon:testnet',
      encryptedKey: { sessionId: 'session-1', jwe: 'a.b.c.d.e' },
    })
  })

  it('rejects did:polygon without a network or an imported key', async () => {
    const noNetwork = await createDidAction(
      null,
      formData({
        method: 'polygon',
        keyType: 'ed25519',
        encryptedKeySessionId: 'session-1',
        encryptedKeyJwe: 'a.b.c.d.e',
      }),
    )
    const noKey = await createDidAction(
      null,
      formData({
        method: 'polygon',
        keyType: 'ed25519',
        network: 'polygon:testnet',
      }),
    )

    expect(noNetwork).toMatchObject({ status: 'error' })
    expect(noKey).toMatchObject({ status: 'error' })
    expect(createHolderDid).not.toHaveBeenCalled()
  })

  it('rejects an incomplete encrypted key and did:x509', async () => {
    const incomplete = await createDidAction(
      null,
      formData({ method: 'key', keyType: 'ed25519', encryptedKeyJwe: 'a.b.c' }),
    )
    const x509 = await createDidAction(
      null,
      formData({ method: 'x509', keyType: 'ed25519' }),
    )

    expect(incomplete).toMatchObject({ status: 'error' })
    expect(x509.message).toContain('credebl/platform#1864')
    expect(createHolderDid).not.toHaveBeenCalled()
  })

  it('returns a validated import session for supported methods', async () => {
    const session = {
      sessionId: 'session-1',
      kid: 'kid-1',
      method: 'polygon',
      expiresAt: '2026-11-25T12:00:00.000Z',
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM',
      publicKeyJwk: { kty: 'RSA', n: 'n', e: 'AQAB' },
      protectedHeader: { alg: 'RSA-OAEP-256', enc: 'A256GCM' },
    }
    vi.mocked(createHolderDidImportSession).mockResolvedValue(session)

    const result = await createDidImportSessionAction('polygon')

    expect(result).toMatchObject({ status: 'success', data: session })
    expect(createHolderDidImportSession).toHaveBeenCalledWith('polygon')
  })

  it('rejects invalid or unsupported import sessions', async () => {
    vi.mocked(createHolderDidImportSession).mockResolvedValue({})

    const invalid = await createDidImportSessionAction('key')
    const unsupported = await createDidImportSessionAction('x509' as 'key')

    expect(invalid).toMatchObject({ status: 'error' })
    expect(unsupported).toMatchObject({ status: 'error' })
    expect(createHolderDidImportSession).toHaveBeenCalledTimes(1)
  })

  it('passes DID binding and notification flags to the issuance API', async () => {
    vi.mocked(requestHolderCredential).mockResolvedValue({ credential: 'ok' })

    const result = await requestCredentialAction(
      null,
      formData({
        credentialOfferUri: 'openid-credential-offer://?x=1',
        credentialsToRequest: 'Degree, IdCard',
        authorizationCode: 'code-1',
        holderDidUrl: 'did:key:z6Mk',
        bindingPolicy: 'require',
        sendNotification: 'false',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(requestHolderCredential).toHaveBeenCalledWith({
      credentialOfferUri: 'openid-credential-offer://?x=1',
      credentialsToRequest: ['Degree', 'IdCard'],
      authorizationCode: 'code-1',
      holderDidUrl: 'did:key:z6Mk',
      bindingPolicy: 'require',
      sendNotification: false,
    })
  })
})
