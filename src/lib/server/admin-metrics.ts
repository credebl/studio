import type {
  AdminDashboardMetrics,
  AdminInvitation,
  AdminInvitationsMetric,
  AdminKnownAgent,
  AdminLedgerSummary,
  AdminOrganizationSummary,
  AdminPlatformFeatures,
  AdminPlatformSettings,
  CloudBaseWalletStatus,
  MetricResult,
} from '@/features/admin/types'
import { type ApiEnvelope, platformFetch } from './platform'
import {
  getCloudBaseWalletStatus,
  getDashboardSummary,
  getKnownAgentOptions,
} from './admin'
import { apiRoutes } from '@/config/apiRoutes'

/**
 * Server-only dashboard data for the platform-admin console.
 *
 * Every source is independent: a failing source is reported as
 * `{ ok: false }` so the dashboard can mark that one card "Unavailable" while
 * the rest still render. Only endpoints that exist in platform v2.3.0 and are
 * open to the platform admin are used.
 */

/** A valid UUID that matches no organization, so none is excluded from lists. */
const NO_EXCLUDED_ORG_ID = '00000000-0000-4000-8000-000000000000'
const RECENT_ORGANIZATIONS = 5
const RECENT_INVITATIONS = 5
const INVITATION_PAGE_SIZE = 50
const MAX_INVITATION_PAGES = 4

const FAILED = { ok: false } as const

const succeed = <T>(value: T): MetricResult<T> => ({ ok: true, value })

const toCount = (value: unknown): number | null => {
  const count = Number(value)
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : null
}

interface ApiResult<T> {
  status: number
  ok: boolean
  body: ApiEnvelope<T> | null
}

const request = async <T>(path: string): Promise<ApiResult<T> | null> => {
  try {
    const response = await platformFetch(path)
    if (!response) {
      return null
    }

    let body: ApiEnvelope<T> | null = null
    try {
      body = (await response.json()) as ApiEnvelope<T>
    } catch {
      body = null
    }

    return { status: response.status, ok: response.ok, body }
  } catch {
    return null
  }
}

/** Runs one source and turns any unexpected error into a failed result. */
const guard = async <T>(
  source: () => Promise<MetricResult<T>>,
): Promise<MetricResult<T>> => {
  try {
    return await source()
  } catch {
    return FAILED
  }
}

const organisationsPath = (pageSize: number): string => {
  const query = new URLSearchParams({
    pageNumber: '1',
    pageSize: String(pageSize),
  })

  return `${apiRoutes.platformAdmin.organisations}/${NO_EXCLUDED_ORG_ID}/get-all-platform-organisations?${query.toString()}`
}

interface OrganisationsPayload {
  totalPages?: number
  orgs?: { id?: unknown; name?: unknown }[]
}

/** With pageSize=1 the number of pages is the number of organizations. */
export const getOrganizationCount = (): Promise<MetricResult<number>> =>
  guard(async () => {
    const result = await request<OrganisationsPayload>(organisationsPath(1))
    if (!result?.ok) {
      return FAILED
    }

    const total = toCount(result.body?.data?.totalPages)
    return total === null ? FAILED : succeed(total)
  })

export const getRecentOrganizations = (): Promise<
  MetricResult<AdminOrganizationSummary[]>
> =>
  guard(async () => {
    const result = await request<OrganisationsPayload>(
      organisationsPath(RECENT_ORGANIZATIONS),
    )
    if (!result?.ok) {
      return FAILED
    }

    const orgs = result.body?.data?.orgs
    if (!Array.isArray(orgs)) {
      return FAILED
    }

    return succeed(
      orgs.flatMap((org): AdminOrganizationSummary[] => {
        if (typeof org?.id !== 'string' || typeof org?.name !== 'string') {
          return []
        }

        return [{ id: org.id, name: org.name }]
      }),
    )
  })

interface CountedPayload {
  totalItems?: number
}

/**
 * The platform answers 404 when there is nothing to list, which is a valid
 * count of zero rather than a failure.
 */
const readTotalItems = async (path: string): Promise<MetricResult<number>> => {
  const result = await request<CountedPayload>(
    `${path}?pageNumber=1&pageSize=1`,
  )
  if (!result) {
    return FAILED
  }

  if (result.status === 404) {
    return succeed(0)
  }

  if (!result.ok) {
    return FAILED
  }

  const total = toCount(result.body?.data?.totalItems)
  return total === null ? FAILED : succeed(total)
}

export const getSchemaCount = (): Promise<MetricResult<number>> =>
  guard(() => readTotalItems(apiRoutes.platformAdmin.schemas))

export const getCredentialDefinitionCount = (): Promise<MetricResult<number>> =>
  guard(() => readTotalItems(apiRoutes.platformAdmin.credentialDefinitions))

export const getLedgers = (): Promise<MetricResult<AdminLedgerSummary[]>> =>
  guard(async () => {
    const result = await request<unknown[]>(apiRoutes.platformAdmin.ledgers)
    if (!result?.ok || !Array.isArray(result.body?.data)) {
      return FAILED
    }

    return succeed(
      result.body.data.flatMap((ledger): AdminLedgerSummary[] => {
        const item = ledger as {
          id?: unknown
          name?: unknown
          networkType?: unknown
        }
        if (typeof item?.id !== 'string' || typeof item?.name !== 'string') {
          return []
        }

        return [
          {
            id: item.id,
            name: item.name,
            ...(typeof item.networkType === 'string'
              ? { networkType: item.networkType }
              : {}),
          },
        ]
      }),
    )
  })

interface InvitationsPayload {
  data?: AdminInvitation[]
  totalPages?: number
}

const fetchInvitationsPage = async (
  page: number,
): Promise<{ data: AdminInvitation[]; totalPages: number } | null> => {
  const query = new URLSearchParams({
    pageNumber: String(page),
    pageSize: String(INVITATION_PAGE_SIZE),
  })
  const result = await request<InvitationsPayload>(
    `${apiRoutes.platformAdmin.invitations}?${query.toString()}`,
  )
  if (!result?.ok || !Array.isArray(result.body?.data?.data)) {
    return null
  }

  return {
    data: result.body.data.data,
    totalPages: Math.max(1, toCount(result.body.data.totalPages) ?? 1),
  }
}

/**
 * Counts invitations by the same rule as the invitations list: an invitation
 * that already created an ecosystem is "created", otherwise "pending". Only
 * the most recent pages are read, and `capped` says when there were more.
 */
export const getInvitationsMetric = (): Promise<
  MetricResult<AdminInvitationsMetric>
> =>
  guard(async () => {
    const first = await fetchInvitationsPage(1)
    if (!first) {
      return FAILED
    }

    const invitations = [...first.data]
    const lastPage = Math.min(first.totalPages, MAX_INVITATION_PAGES)
    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchInvitationsPage(page)
      if (!next) {
        break
      }
      invitations.push(...next.data)
    }

    const created = invitations.filter((item) => Boolean(item.ecosystem)).length

    return succeed({
      created,
      pending: invitations.length - created,
      counted: invitations.length,
      capped: first.totalPages > MAX_INVITATION_PAGES,
      recent: first.data.slice(0, RECENT_INVITATIONS),
    })
  })

interface PlatformSettingsPayload {
  platform_config?: Record<string, unknown>[]
}

const readPlatformConfigRow = async (): Promise<Record<
  string,
  unknown
> | null> => {
  const result = await request<PlatformSettingsPayload>(
    apiRoutes.platformAdmin.platformSettings,
  )
  if (!result?.ok) {
    return null
  }

  const row = result.body?.data?.platform_config?.[0]
  return row && typeof row === 'object' ? row : null
}

const text = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const isoDate = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    return undefined
  }

  return value
}

/**
 * Reads the platform settings but returns only the ecosystem flag. The rows
 * also hold keys and endpoints, which must never reach the dashboard.
 */
export const getPlatformFeatures = (): Promise<
  MetricResult<AdminPlatformFeatures>
> =>
  guard(async () => {
    const row = await readPlatformConfigRow()
    if (!row) {
      return FAILED
    }

    const flag = row.isEcosystemEnabled
    return succeed({
      ecosystemEnabled: typeof flag === 'boolean' ? flag : null,
    })
  })

/**
 * Platform configuration for the read-only settings page. Only allow-listed
 * fields are copied: the email API key is reduced to a flag (not even its
 * length is kept) and ids, audit user ids and soft-delete markers are dropped.
 */
export const getPlatformSettings = (): Promise<
  MetricResult<AdminPlatformSettings>
> =>
  guard(async () => {
    const row = await readPlatformConfigRow()
    if (!row) {
      return FAILED
    }

    const flag = row.isEcosystemEnabled
    const createdAt = isoDate(row.createDateTime)
    const updatedAt = isoDate(row.lastChangedDateTime)

    return succeed({
      externalIp: text(row.externalIp),
      inboundEndpoint: text(row.inboundEndpoint),
      apiEndpoint: text(row.apiEndpoint),
      tailsFileServer: text(row.tailsFileServer),
      emailFrom: text(row.emailFrom),
      emailUsername: text(row.username),
      emailApiKeyConfigured: text(row.sgApiKey).length > 0,
      ecosystemEnabled: typeof flag === 'boolean' ? flag : null,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    })
  })

const normalizeEndpoint = (endpoint: string): string =>
  endpoint.trim().replace(/\/+$/, '').toLowerCase()

/**
 * Agents Studio can find from its allow-list, the cloud base wallet and the
 * admin's own organizations. Token endpoints are deliberately not returned.
 */
export const getKnownAgents = (
  cloudEndpoint?: string,
): Promise<MetricResult<AdminKnownAgent[]>> =>
  guard(async () => {
    const options = await getKnownAgentOptions(cloudEndpoint)
    const cloud = cloudEndpoint ? normalizeEndpoint(cloudEndpoint) : ''

    return succeed(
      options.map((option) => ({
        id: option.id,
        label: option.label,
        endpoint: option.endpoint,
        source: option.source,
        isCloudBase:
          option.source === 'cloud-wallet' ||
          (cloud !== '' && normalizeEndpoint(option.endpoint) === cloud),
      })),
    )
  })

export const getAdminDashboardMetrics =
  async (): Promise<AdminDashboardMetrics> => {
    const cloudWalletStatus = getCloudBaseWalletStatus().catch(
      (): CloudBaseWalletStatus => ({ configured: false }),
    )

    const [
      summary,
      organizationCount,
      recentOrganizations,
      schemaCount,
      credentialDefinitionCount,
      ledgers,
      invitations,
      features,
      cloudWallet,
      knownAgents,
    ] = await Promise.all([
      guard(async () => {
        const value = await getDashboardSummary()
        return value ? succeed(value) : FAILED
      }),
      getOrganizationCount(),
      getRecentOrganizations(),
      getSchemaCount(),
      getCredentialDefinitionCount(),
      getLedgers(),
      getInvitationsMetric(),
      getPlatformFeatures(),
      cloudWalletStatus,
      cloudWalletStatus.then((status) => getKnownAgents(status.agentEndpoint)),
    ])

    return {
      summary,
      organizationCount,
      recentOrganizations,
      schemaCount,
      credentialDefinitionCount,
      ledgers,
      invitations,
      features,
      knownAgents,
      cloudWallet,
    }
  }
