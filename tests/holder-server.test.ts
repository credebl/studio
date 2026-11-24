import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHolderWallet,
  getHolderSession,
  getHolderWalletState,
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

const profileWithRole = (role = 'holder'): Response =>
  jsonResponse({ data: { userOrgRoles: [{ orgRole: { name: role } }] } })

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

  it('re-validates a stale claim against the live holder role', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ hasHolderAccess: false }),
    )
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole())

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
      .mockResolvedValueOnce(profileWithRole('owner'))

    await expect(getHolderSession()).resolves.toBeNull()
  })

  it('fails closed when the profile lookup fails', async () => {
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
      .mockResolvedValueOnce(profileWithRole('issuer'))
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
