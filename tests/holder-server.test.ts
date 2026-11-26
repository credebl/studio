import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHolderWallet,
  getHolderSession,
  getHolderWalletState,
  getPrimaryDidUrl,
  requestHolderCredential,
  requireHolderSession,
} from '@/lib/server/holder'
import { jsonResponse, makeSession } from './helpers'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    cache: <T>(callback: T): T => callback,
  }
})

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/utils/authOptions', () => ({ authOptions: {} }))
vi.mock('@/app/api/server/encryption', () => ({
  passwordEncryption: (value: string): string => `encrypted:${value}`,
}))

let fetchMock: Mock<typeof fetch> = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
})

const sessionTokens = (): Response =>
  jsonResponse({
    data: { sessionToken: 'access-token', refreshToken: 'refresh-token' },
  })

describe('getHolderSession', () => {
  it('denies access without a session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await expect(getHolderSession()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('denies access when the session has no sessionId', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ sessionId: undefined }),
    )

    await expect(getHolderSession()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('re-validates a stale claim against the live wallet probe', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ hasHolderAccess: false }),
    )
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 404))

    await expect(getHolderSession()).resolves.toMatchObject({
      sessionId: 'session-1',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('denies a revoked holder even when the claim is true', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ hasHolderAccess: true }),
    )
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 403))

    await expect(getHolderSession()).resolves.toBeNull()
  })

  it('fails closed when the wallet probe fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 500))

    await expect(getHolderSession()).resolves.toBeNull()
  })
})

describe('requireHolderSession', () => {
  it('redirects unauthenticated users to sign-in', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(requireHolderSession()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })

  it('redirects non-holders to the dashboard', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 403))
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(requireHolderSession()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })
})

describe('holder wallet state', () => {
  it('treats a 404 from GET /did as no wallet', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 404))

    await expect(getHolderWalletState()).resolves.toEqual({
      available: true,
      hasWallet: false,
      dids: [],
    })
  })

  it('normalizes DIDs when a wallet exists', async () => {
    fetchMock.mockResolvedValueOnce(sessionTokens()).mockResolvedValueOnce(
      jsonResponse({
        data: [{ id: 'did-1', did: 'did:key:z6Mk', method: 'key' }],
      }),
    )

    await expect(getHolderWalletState()).resolves.toMatchObject({
      available: true,
      hasWallet: true,
      dids: [{ did: 'did:key:z6Mk', method: 'key' }],
    })
  })

  it('reports the wallet as unavailable when the service fails', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 500))

    await expect(getHolderWalletState()).resolves.toEqual({
      available: false,
      hasWallet: false,
      dids: [],
    })
  })

  it('explains a missing holder entitlement on a 403', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 403))

    await expect(getHolderWalletState()).resolves.toMatchObject({
      available: false,
      hasWallet: false,
      message: expect.stringContaining('holder entitlement'),
    })
  })
})

describe('holder wallet calls', () => {
  it('creates a wallet without sending an orgId', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'wallet-1' } }, 201))

    await expect(createHolderWallet('My wallet')).resolves.toEqual({
      id: 'wallet-1',
    })

    const url = String(fetchMock.mock.calls[1]?.[0])
    const init = fetchMock.mock.calls[1]?.[1]
    expect(url).toBe('http://platform.test/create-wallet')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ label: 'My wallet' })
    expect(String(init?.body)).not.toContain('orgId')
  })

  it('uses a safe message for duplicate wallet errors', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ message: 'raw detail' }, 409))

    await expect(createHolderWallet('My wallet')).rejects.toThrow(
      'A personal wallet already exists for this account.',
    )
  })
})

const lastRequestUrl = (): string => String(fetchMock.mock.calls.at(-1)?.[0])

const lastRequestBody = (): Record<string, unknown> =>
  JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body)) as Record<
    string,
    unknown
  >

describe('credential binding forwarding', () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
  })

  it('forwards the nested binding unchanged and omits a flat DID', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: {} }))

    await expect(
      requestHolderCredential({
        credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
        credentialsToRequest: ['person-sdjwt'],
        binding: {
          mode: 'new-key',
          didMethod: 'did:jwk',
          signatureAlgorithm: 'EdDSA',
        },
        sendNotification: true,
      }),
    ).resolves.toBeDefined()

    expect(lastRequestUrl()).toBe(
      'http://platform.test/oid4vc/holder/request-credential',
    )
    expect(lastRequestBody().binding).toEqual({
      mode: 'new-key',
      didMethod: 'did:jwk',
      signatureAlgorithm: 'EdDSA',
    })
    expect(lastRequestBody()).not.toHaveProperty('holderDidUrl')
  })

  it('keeps the flat holderDidUrl form backward compatible', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ data: {} }))

    await requestHolderCredential({
      credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
      credentialsToRequest: ['person-sdjwt'],
      holderDidUrl: 'did:web:holder.example.com#key-1',
      bindingPolicy: 'prefer',
    })

    expect(lastRequestBody()).toMatchObject({
      holderDidUrl: 'did:web:holder.example.com#key-1',
      bindingPolicy: 'prefer',
    })
    expect(lastRequestBody()).not.toHaveProperty('binding')
  })

  it('rejects conflicting forms before any token is redeemed', async () => {
    await expect(
      requestHolderCredential({
        credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
        credentialsToRequest: ['person-sdjwt'],
        holderDidUrl: 'did:key:z6Mkflat',
        binding: {
          mode: 'existing-did',
          holderDidUrl: 'did:web:holder.example.com#key-1',
        },
      }),
    ).rejects.toThrow('CONFLICTING_HOLDER_DID_URL')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps upstream binding errors without leaking the upstream body', async () => {
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
      requestHolderCredential({
        credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
        credentialsToRequest: ['person-sdjwt'],
        binding: { mode: 'new-key', signatureAlgorithm: 'PS256' },
      }),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_PROOF_ALGORITHM',
      status: 400,
      message: 'The proof algorithm is not supported by this offer',
    })
  })
})

describe('primary DID suggestion', () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
  })

  it('reads the org-scoped primary DID preference', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({ data: { didUrl: 'did:web:holder.example.com#key-1' } }),
      )

    await expect(getPrimaryDidUrl('org-1', 'user-1')).resolves.toBe(
      'did:web:holder.example.com#key-1',
    )
    expect(lastRequestUrl()).toBe(
      'http://platform.test/orgs/org-1/users/user-1/oid4vc/holder/primary-did',
    )
  })

  it('resolves the platform user id from session details when none is supplied', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ user: { id: '', name: 'Holder' } }),
    )
    const details = (): Response =>
      jsonResponse({
        data: {
          sessionToken: 'access-token',
          refreshToken: 'refresh-token',
          userId: 'platform-user-1',
        },
      })
    fetchMock
      .mockResolvedValueOnce(details())
      .mockResolvedValueOnce(details())
      .mockResolvedValueOnce(
        jsonResponse({ data: { didUrl: 'did:key:z6MkSuggestion' } }),
      )

    await expect(getPrimaryDidUrl('org-1')).resolves.toBe(
      'did:key:z6MkSuggestion',
    )
    expect(lastRequestUrl()).toBe(
      'http://platform.test/orgs/org-1/users/platform-user-1/oid4vc/holder/primary-did',
    )
  })

  it('returns null for an absent preference', async () => {
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(getPrimaryDidUrl('org-1', 'user-1')).resolves.toBeNull()
  })

  it('does not call the platform without an org id', async () => {
    await expect(getPrimaryDidUrl(null, 'user-1')).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
