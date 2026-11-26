import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { jsonResponse, makeSession } from './helpers'
import { getKnownAgentOptions } from '@/lib/server/admin'
import { getServerSession } from 'next-auth/next'

interface MockCookieStore {
  get: () => { value: string } | undefined
  set: () => void
}

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
vi.mock('next/headers', () => ({
  cookies: async (): Promise<MockCookieStore> => ({
    get: (): undefined => undefined,
    set: (): void => undefined,
  }),
}))

let fetchMock: Mock<typeof fetch> = vi.fn<typeof fetch>()
const originalAllowlist = process.env.STUDIO_KNOWN_AGENTS

const sessionTokens = (): Response =>
  jsonResponse({
    data: { sessionToken: 'access-token', refreshToken: 'refresh-token' },
  })

const profileWithRole = (role: string): Response =>
  jsonResponse({
    data: { userOrgRoles: [{ orgRole: { name: role } }] },
  })

const profileWithRoles = (...roles: string[]): Response =>
  jsonResponse({
    data: {
      userOrgRoles: roles.map((name) => ({ orgRole: { name } })),
    },
  })

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  if (originalAllowlist === undefined) {
    delete process.env.STUDIO_KNOWN_AGENTS
  } else {
    process.env.STUDIO_KNOWN_AGENTS = originalAllowlist
  }
})

describe('getKnownAgentOptions', () => {
  it('returns no candidates for a non-admin session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await expect(getKnownAgentOptions()).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses the allowlist and stored endpoint without org lookups for an admin-only session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    process.env.STUDIO_KNOWN_AGENTS = JSON.stringify([
      {
        label: 'Local shared agent',
        endpoint: 'http://host.docker.internal:4001',
        tokenEndpoint: 'http://localhost:4001',
      },
    ])
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole('platform_admin'))
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRole('platform_admin'))

    const options = await getKnownAgentOptions('https://cloud.example.com:4001')

    expect(options.map((option) => option.label)).toEqual([
      'Local shared agent',
      'Cloud base wallet',
    ])
    expect(options[0]).toMatchObject({
      endpoint: 'http://host.docker.internal:4001',
      tokenEndpoint: 'http://localhost:4001',
      source: 'allowlist',
    })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('includes org agents when the admin also holds an org role', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRoles('platform_admin', 'owner'))
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRoles('platform_admin', 'owner'))
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            organizations: [
              {
                id: '11111111-1111-4111-8111-111111111111',
                name: 'Engineering',
              },
            ],
          },
        }),
      )
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            ['org_agents']: [
              {
                agentEndPoint: 'https://org.example.com:4001',
                tenantId: 'tenant-1',
              },
            ],
          },
        }),
      )

    const options = await getKnownAgentOptions()

    expect(options).toEqual([
      {
        id: 'platform-org:11111111-1111-4111-8111-111111111111:https://org.example.com:4001',
        label: 'Org agent: Engineering',
        endpoint: 'https://org.example.com:4001',
        source: 'platform-org',
      },
    ])

    const orgListUrl = String(fetchMock.mock.calls[5][0])
    expect(orgListUrl).toContain('/orgs?')
    expect(orgListUrl).toContain('role=owner')
    expect(String(fetchMock.mock.calls[7][0])).toContain(
      '/orgs/11111111-1111-4111-8111-111111111111',
    )
  })

  it('silently skips org candidates when the org lookup is forbidden', async () => {
    vi.mocked(getServerSession).mockResolvedValue(makeSession())
    fetchMock
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRoles('platform_admin', 'owner'))
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(profileWithRoles('platform_admin', 'owner'))
      .mockResolvedValueOnce(sessionTokens())
      .mockResolvedValueOnce(jsonResponse({}, 403))

    await expect(getKnownAgentOptions()).resolves.toEqual([])
  })
})
