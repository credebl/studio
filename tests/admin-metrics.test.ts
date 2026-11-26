import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import { adminNavGroups, isAdminNavActive } from '@/components/layout/admin-nav'
import {
  getAdminDashboardMetrics,
  getCredentialDefinitionCount,
  getInvitationsMetric,
  getKnownAgents,
  getLedgers,
  getOrganizationCount,
  getPlatformFeatures,
  getPlatformSettings,
  getRecentOrganizations,
  getSchemaCount,
} from '@/lib/server/admin-metrics'
import type { AdminInvitation } from '@/features/admin/types'
import { jsonResponse } from './helpers'

const platformFetch = vi.hoisted(() => vi.fn())
const getDashboardSummary = vi.hoisted(() => vi.fn())
const getCloudBaseWalletStatus = vi.hoisted(() => vi.fn())
const getKnownAgentOptions = vi.hoisted(() => vi.fn())

vi.mock('@/lib/server/platform', () => ({ platformFetch }))
vi.mock('@/lib/server/admin', () => ({
  getDashboardSummary,
  getCloudBaseWalletStatus,
  getKnownAgentOptions,
}))

// The platform names this field in snake case.
const settingsBody = (rows: object[]): { data: object } => ({
  data: { ['platform_config']: rows },
})

const fetchMock = platformFetch as Mock<
  (path: string) => Promise<Response | null>
>

const respondWith = (
  routes: Record<string, () => Response | null | Promise<Response | null>>,
): void => {
  fetchMock.mockImplementation(async (path: string) => {
    const key = Object.keys(routes).find((route) => path.includes(route))
    return key ? routes[key]() : jsonResponse({}, 500)
  })
}

beforeEach(() => {
  fetchMock.mockReset()
  getDashboardSummary.mockReset()
  getCloudBaseWalletStatus.mockReset()
  getKnownAgentOptions.mockReset()
  getKnownAgentOptions.mockResolvedValue([])
})

describe('organizations', () => {
  it('uses the number of pages at pageSize=1 as the organization total', async () => {
    respondWith({
      'pageSize=1': () => jsonResponse({ data: { totalPages: 7, orgs: [] } }),
    })

    expect(await getOrganizationCount()).toEqual({ ok: true, value: 7 })
    expect(fetchMock.mock.calls[0][0]).toContain(
      '/orgs/00000000-0000-4000-8000-000000000000/get-all-platform-organisations',
    )
  })

  it('fails when the platform errors or the total is not a number', async () => {
    respondWith({ 'pageSize=1': () => jsonResponse({}, 500) })
    expect(await getOrganizationCount()).toEqual({ ok: false })

    respondWith({
      'pageSize=1': () => jsonResponse({ data: { totalPages: 'many' } }),
    })
    expect(await getOrganizationCount()).toEqual({ ok: false })
  })

  it('keeps only well-formed recent organizations', async () => {
    respondWith({
      'pageSize=5': () =>
        jsonResponse({
          data: {
            orgs: [
              { id: 'o1', name: 'Acme' },
              { id: 2, name: 'bad id' },
              { id: 'o3' },
              null,
              { id: 'o4', name: 'Globex' },
            ],
          },
        }),
    })

    expect(await getRecentOrganizations()).toEqual({
      ok: true,
      value: [
        { id: 'o1', name: 'Acme' },
        { id: 'o4', name: 'Globex' },
      ],
    })
  })

  it('is unavailable when the request cannot be made', async () => {
    fetchMock.mockResolvedValue(null)
    expect(await getRecentOrganizations()).toEqual({ ok: false })
    fetchMock.mockRejectedValue(new Error('network'))
    expect(await getOrganizationCount()).toEqual({ ok: false })
  })
})

describe('schema and credential definition counts', () => {
  it('reads the real total from totalItems', async () => {
    respondWith({
      '/platform/schemas': () => jsonResponse({ data: { totalItems: 42 } }),
      '/platform/cred-defs': () => jsonResponse({ data: { totalItems: 9 } }),
    })

    expect(await getSchemaCount()).toEqual({ ok: true, value: 42 })
    expect(await getCredentialDefinitionCount()).toEqual({ ok: true, value: 9 })
  })

  it('treats 404 (nothing to list) as zero, not as a failure', async () => {
    respondWith({
      '/platform/schemas': () => jsonResponse({ message: 'none' }, 404),
    })

    expect(await getSchemaCount()).toEqual({ ok: true, value: 0 })
  })

  it('fails on other errors and on a missing total', async () => {
    respondWith({ '/platform/schemas': () => jsonResponse({}, 500) })
    expect(await getSchemaCount()).toEqual({ ok: false })

    respondWith({ '/platform/cred-defs': () => jsonResponse({ data: {} }) })
    expect(await getCredentialDefinitionCount()).toEqual({ ok: false })
  })
})

describe('ledgers', () => {
  it('returns id, name and network type only', async () => {
    respondWith({
      '/platform/ledgers': () =>
        jsonResponse({
          data: [
            {
              id: 'l1',
              name: 'Polygon',
              networkType: 'testnet',
              poolConfig: 'secret-ish',
            },
            { id: 'l2', name: 'Indy' },
            { id: 3, name: 'broken' },
          ],
        }),
    })

    expect(await getLedgers()).toEqual({
      ok: true,
      value: [
        { id: 'l1', name: 'Polygon', networkType: 'testnet' },
        { id: 'l2', name: 'Indy' },
      ],
    })
  })

  it('fails when the response is not a list', async () => {
    respondWith({ '/platform/ledgers': () => jsonResponse({ data: {} }) })
    expect(await getLedgers()).toEqual({ ok: false })
  })
})

describe('invitations', () => {
  const invitation = (id: string, created: boolean): AdminInvitation => ({
    id,
    email: `${id}@example.test`,
    status: 'x',
    createDateTime: '2026-01-01T00:00:00.000Z',
    ecosystem: created
      ? {
          id: `e-${id}`,
          name: 'E',
          description: '',
          createDateTime: '2026-01-01T00:00:00.000Z',
        }
      : null,
  })

  it('counts created and pending and keeps the five most recent', async () => {
    const data = [
      invitation('a', true),
      invitation('b', false),
      invitation('c', false),
      invitation('d', true),
      invitation('e', false),
      invitation('f', false),
    ]
    respondWith({
      '/invitations': () => jsonResponse({ data: { data, totalPages: 1 } }),
    })

    const result = await getInvitationsMetric()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toMatchObject({
        created: 2,
        pending: 4,
        counted: 6,
        capped: false,
      })
      expect(result.value.recent.map((item) => item.id)).toEqual([
        'a',
        'b',
        'c',
        'd',
        'e',
      ])
    }
  })

  it('stops at four pages and says the count is capped', async () => {
    respondWith({
      '/invitations': () =>
        jsonResponse({
          data: { data: [invitation('x', false)], totalPages: 9 },
        }),
    })

    const result = await getInvitationsMetric()
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(result.ok && result.value.capped).toBe(true)
    expect(result.ok && result.value.counted).toBe(4)
  })

  it('keeps what it counted when a later page fails', async () => {
    let call = 0
    respondWith({
      '/invitations': () => {
        call += 1
        return call === 1
          ? jsonResponse({
              data: { data: [invitation('a', false)], totalPages: 3 },
            })
          : jsonResponse({}, 500)
      },
    })

    const result = await getInvitationsMetric()
    expect(result.ok && result.value.counted).toBe(1)
  })

  it('is unavailable when the first page fails', async () => {
    respondWith({ '/invitations': () => jsonResponse({}, 500) })
    expect(await getInvitationsMetric()).toEqual({ ok: false })
  })
})

describe('platform features', () => {
  it('returns only the ecosystem flag and never other settings', async () => {
    respondWith({
      '/users/platform-settings': () =>
        jsonResponse(
          settingsBody([
            {
              isEcosystemEnabled: true,
              sgApiKey: 'SECRET-KEY',
              username: 'smtp-user',
              apiEndpoint: 'http://internal',
            },
          ]),
        ),
    })

    const result = await getPlatformFeatures()
    expect(result).toEqual({ ok: true, value: { ecosystemEnabled: true } })
    expect(JSON.stringify(result)).not.toContain('SECRET-KEY')
    expect(JSON.stringify(result)).not.toContain('smtp-user')
  })

  it('reports an unknown flag as null and a bad response as unavailable', async () => {
    respondWith({
      '/users/platform-settings': () => jsonResponse(settingsBody([{}])),
    })
    expect(await getPlatformFeatures()).toEqual({
      ok: true,
      value: { ecosystemEnabled: null },
    })

    respondWith({ '/users/platform-settings': () => jsonResponse({}, 500) })
    expect(await getPlatformFeatures()).toEqual({ ok: false })
  })
})

describe('platform settings (view only)', () => {
  const row = {
    id: 'row-id',
    externalIp: ' 10.0.0.5 ',
    inboundEndpoint: null,
    username: 'mailer',
    sgApiKey: 'SG.super-secret-key',
    emailFrom: 'no-reply@example.test',
    isEcosystemEnabled: false,
    apiEndpoint: 'https://api.example.test',
    tailsFileServer: 'https://tails.example.test',
    createDateTime: '2026-11-24T17:49:09.142Z',
    createdBy: '1',
    lastChangedDateTime: 'not a date',
    lastChangedBy: 'user-9',
    deletedAt: null,
  }

  it('exposes the allow-listed fields and trims values', async () => {
    respondWith({
      '/users/platform-settings': () => jsonResponse(settingsBody([row])),
    })

    expect(await getPlatformSettings()).toEqual({
      ok: true,
      value: {
        externalIp: '10.0.0.5',
        inboundEndpoint: '',
        apiEndpoint: 'https://api.example.test',
        tailsFileServer: 'https://tails.example.test',
        emailFrom: 'no-reply@example.test',
        emailUsername: 'mailer',
        emailApiKeyConfigured: true,
        ecosystemEnabled: false,
        createdAt: '2026-11-24T17:49:09.142Z',
      },
    })
  })

  it('never carries the API key, ids or audit users', async () => {
    respondWith({
      '/users/platform-settings': () => jsonResponse(settingsBody([row])),
    })

    const json = JSON.stringify(await getPlatformSettings())
    expect(json).not.toContain('super-secret')
    expect(json).not.toContain('row-id')
    expect(json).not.toContain('user-9')
    expect(json).not.toContain('sgApiKey')
  })

  it('reports a missing or blank API key as not configured', async () => {
    respondWith({
      '/users/platform-settings': () =>
        jsonResponse(settingsBody([{ ...row, sgApiKey: '   ' }])),
    })
    const blank = await getPlatformSettings()
    expect(blank.ok && blank.value.emailApiKeyConfigured).toBe(false)

    respondWith({
      '/users/platform-settings': () =>
        jsonResponse(settingsBody([{ ...row, sgApiKey: undefined }])),
    })
    const missing = await getPlatformSettings()
    expect(missing.ok && missing.value.emailApiKeyConfigured).toBe(false)
  })

  it('is unavailable when there is no settings row or the call fails', async () => {
    respondWith({
      '/users/platform-settings': () => jsonResponse(settingsBody([])),
    })
    expect(await getPlatformSettings()).toEqual({ ok: false })

    respondWith({ '/users/platform-settings': () => jsonResponse({}, 403) })
    expect(await getPlatformSettings()).toEqual({ ok: false })
  })
})

describe('known agents', () => {
  const options = [
    {
      id: 'allowlist:0:http://agent.example:4001',
      label: 'Local shared agent',
      endpoint: 'http://agent.example:4001',
      tokenEndpoint: 'http://localhost:4001',
      description: 'internal note',
      source: 'allowlist',
    },
    {
      id: 'platform-org:o1:http://org.example',
      label: 'Org agent: Acme',
      endpoint: 'http://org.example',
      source: 'platform-org',
    },
  ]

  it('lists agents without token endpoints or descriptions', async () => {
    getKnownAgentOptions.mockResolvedValue(options)

    const result = await getKnownAgents()
    expect(result).toEqual({
      ok: true,
      value: [
        {
          id: options[0].id,
          label: 'Local shared agent',
          endpoint: 'http://agent.example:4001',
          source: 'allowlist',
          isCloudBase: false,
        },
        {
          id: options[1].id,
          label: 'Org agent: Acme',
          endpoint: 'http://org.example',
          source: 'platform-org',
          isCloudBase: false,
        },
      ],
    })
    expect(JSON.stringify(result)).not.toContain('localhost:4001')
    expect(JSON.stringify(result)).not.toContain('internal note')
  })

  it('marks the cloud base agent, ignoring case and a trailing slash', async () => {
    getKnownAgentOptions.mockResolvedValue(options)

    const result = await getKnownAgents('HTTP://Agent.example:4001/')
    expect(getKnownAgentOptions).toHaveBeenCalledWith(
      'HTTP://Agent.example:4001/',
    )
    expect(result.ok && result.value.map((agent) => agent.isCloudBase)).toEqual(
      [true, false],
    )
  })

  it('marks an entry that came from the cloud wallet itself', async () => {
    getKnownAgentOptions.mockResolvedValue([
      {
        id: 'cloud-wallet:current',
        label: 'Cloud base wallet',
        endpoint: 'http://cw.example',
        source: 'cloud-wallet',
      },
    ])

    const result = await getKnownAgents()
    expect(result.ok && result.value[0].isCloudBase).toBe(true)
  })

  it('is unavailable when the lookup throws', async () => {
    getKnownAgentOptions.mockRejectedValue(new Error('boom'))
    expect(await getKnownAgents()).toEqual({ ok: false })
  })

  it('is included in the dashboard metrics and uses the stored endpoint', async () => {
    getDashboardSummary.mockResolvedValue(null)
    getCloudBaseWalletStatus.mockResolvedValue({
      configured: true,
      agentEndpoint: 'http://agent.example:4001',
    })
    getKnownAgentOptions.mockResolvedValue(options)
    fetchMock.mockResolvedValue(null)

    const metrics = await getAdminDashboardMetrics()
    expect(getKnownAgentOptions).toHaveBeenCalledWith(
      'http://agent.example:4001',
    )
    expect(metrics.knownAgents.ok && metrics.knownAgents.value).toHaveLength(2)
  })
})

describe('getAdminDashboardMetrics', () => {
  it('lets one failing source leave the others intact', async () => {
    getDashboardSummary.mockResolvedValue(null)
    getCloudBaseWalletStatus.mockResolvedValue({ configured: true })
    respondWith({
      'get-all-platform-organisations': () =>
        jsonResponse({ data: { totalPages: 3, orgs: [] } }),
      '/platform/schemas': () => jsonResponse({ data: { totalItems: 5 } }),
      '/platform/cred-defs': () => jsonResponse({}, 500),
      '/platform/ledgers': () => jsonResponse({ data: [] }),
    })

    const metrics = await getAdminDashboardMetrics()

    expect(metrics.summary).toEqual({ ok: false })
    expect(metrics.credentialDefinitionCount).toEqual({ ok: false })
    expect(metrics.schemaCount).toEqual({ ok: true, value: 5 })
    expect(metrics.ledgers).toEqual({ ok: true, value: [] })
    expect(metrics.cloudWallet).toEqual({ configured: true })
  })

  it('does not throw when the cloud wallet status cannot be read', async () => {
    getDashboardSummary.mockResolvedValue({
      ecosystem: 1,
      invitations: 2,
      activeOrgs: 3,
    })
    getCloudBaseWalletStatus.mockRejectedValue(new Error('cookies'))
    fetchMock.mockResolvedValue(null)

    const metrics = await getAdminDashboardMetrics()

    expect(metrics.cloudWallet).toEqual({ configured: false })
    expect(metrics.summary.ok).toBe(true)
    expect(metrics.organizationCount).toEqual({ ok: false })
  })
})

describe('admin navigation', () => {
  it('groups pages by purpose and only lists real admin routes', () => {
    expect(adminNavGroups.map((group) => group.label)).toEqual([
      'Overview',
      'Platform',
      'Ecosystem',
    ])
    const urls = adminNavGroups.flatMap((group) =>
      group.items.map((item) => item.url),
    )
    expect(urls).toEqual([
      '/admin',
      '/admin/platform-settings',
      '/admin/cloud-wallet',
      '/admin/invitations',
      '/admin/settings',
    ])
  })

  it('matches the dashboard exactly and other pages by prefix', () => {
    expect(isAdminNavActive('/admin', '/admin')).toBe(true)
    expect(isAdminNavActive('/admin/settings', '/admin')).toBe(false)
    expect(isAdminNavActive('/admin/settings', '/admin/settings')).toBe(true)
    expect(isAdminNavActive('/admin/settings/x', '/admin/settings')).toBe(true)
    expect(isAdminNavActive('/admin/settingsx', '/admin/settings')).toBe(false)
  })
})
