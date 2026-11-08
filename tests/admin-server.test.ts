import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getDashboardSummary,
  getPlatformAdminSession,
  getPlatformInvitations,
  inviteEcosystemOwner,
  requirePlatformAdmin,
  updateEcosystemStatus,
} from '@/lib/server/admin'
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

const profileWithRole = (role = 'platform_admin'): Response =>
  jsonResponse({ data: { userOrgRoles: [{ orgRole: { name: role } }] } })

describe('getPlatformAdminSession', () => {
  it('denies access when there is no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await expect(getPlatformAdminSession()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('denies access when the session has no sessionId', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ sessionId: undefined }),
    )

    await expect(getPlatformAdminSession()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('re-validates a true claim against the live profile', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole())

    await expect(getPlatformAdminSession()).resolves.toMatchObject({
      sessionId: 'session-1',
      isPlatformAdmin: true,
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('denies a session when the role lookup fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ isPlatformAdmin: false }),
    )
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 403))

    await expect(getPlatformAdminSession()).resolves.toBeNull()
  })

  it('denies a stale session when the live profile has no admin role', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ isPlatformAdmin: false }),
    )
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole('owner'))

    await expect(getPlatformAdminSession()).resolves.toBeNull()
  })

  it('allows a stale session when the live profile holds platform_admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ isPlatformAdmin: false }),
    )
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole())

    await expect(getPlatformAdminSession()).resolves.toMatchObject({
      sessionId: 'session-1',
    })
  })

  it('denies a stale session when the profile endpoint errors', async () => {
    vi.mocked(getServerSession).mockResolvedValue(
      makeSession({ isPlatformAdmin: false }),
    )
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 500))

    await expect(getPlatformAdminSession()).resolves.toBeNull()
  })

  it('never exposes backend tokens on the client-facing session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole())

    const session = await getPlatformAdminSession()

    expect(session).not.toHaveProperty('accessToken')
    expect(session).not.toHaveProperty('refreshToken')
    expect(JSON.stringify(session)).not.toContain('access-token')
    expect(JSON.stringify(session)).not.toContain('refresh-token')
  })

  it('denies a revoked admin even when the JWT claim is stale', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole('owner'))

    await expect(getPlatformAdminSession()).resolves.toBeNull()
  })
})

describe('requirePlatformAdmin', () => {
  it('redirects unauthenticated users to the dashboard', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(requirePlatformAdmin()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('allows platform admins through', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole())

    await expect(requirePlatformAdmin()).resolves.toBeUndefined()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects a revoked admin even with a stale claim', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole('owner'))
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(requirePlatformAdmin()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })
})

describe('admin data access', () => {
  it('parses dashboard metrics and defaults missing fields to zero', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({ data: { ecosystem: '4', invitations: 2 } }),
      )

    await expect(getDashboardSummary()).resolves.toEqual({
      ecosystem: 4,
      invitations: 2,
      activeOrgs: 0,
    })
  })

  it('returns null when the dashboard endpoint fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 500))

    await expect(getDashboardSummary()).resolves.toBeNull()
  })

  it('returns null when the dashboard response is not JSON', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(new Response('not-json', { status: 200 }))

    await expect(getDashboardSummary()).resolves.toBeNull()
  })

  it('returns an empty invitation page when the backend rejects the call', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({ message: 'nope' }, 500))

    await expect(getPlatformInvitations({ page: 1 })).resolves.toEqual({
      data: [],
      totalPages: 1,
    })
  })

  it('normalizes a malformed invitation payload instead of leaking it', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({ data: { data: 'not-an-array', totalPages: 0 } }),
      )

    await expect(getPlatformInvitations({ page: 1 })).resolves.toEqual({
      data: [],
      totalPages: 1,
    })
  })

  it('throws a generic error when creating an invitation fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({ message: 'raw backend detail' }, 500),
      )

    await expect(inviteEcosystemOwner('new@example.com')).rejects.toThrow(
      'Unable to create the ecosystem invitation',
    )
  })

  it('throws a generic error when updating the ecosystem setting fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({ message: 'raw backend detail' }, 500),
      )

    await expect(updateEcosystemStatus(true)).rejects.toThrow(
      'Unable to update the ecosystem setting',
    )
  })

  it('refreshes an expired access token once and retries the request', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(
        jsonResponse({ data: { ['access_token']: 'fresh-token' } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: { ecosystem: 1, invitations: 2, activeOrgs: 3 } }),
      )

    await expect(getDashboardSummary()).resolves.toEqual({
      ecosystem: 1,
      invitations: 2,
      activeOrgs: 3,
    })

    const lastCall = fetchMock.mock.calls.at(-1)
    const headers = lastCall?.[1]?.headers as Record<string, string> | undefined

    expect(headers?.Authorization).toBe('Bearer fresh-token')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('does not retry endlessly when the refresh token is rejected', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401))

    await expect(getDashboardSummary()).resolves.toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
