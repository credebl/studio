import type {
  AdminDashboardSummary,
  AdminInvitation,
  AdminInvitationPage,
  CloudBaseWalletConfigInput,
  CloudBaseWalletStatus,
  CloudBaseWalletSummary,
  KnownAgentOption,
} from '@/features/admin/types'
import {
  buildKnownAgentOptions,
  parseKnownAgentAllowlist,
} from '@/lib/server/known-agents'
import type { Session } from 'next-auth'
import { apiRoutes } from '@/config/apiRoutes'
import { authOptions } from '@/utils/authOptions'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth/next'
import { loadAccessibleOrgAgents } from '@/lib/server/known-agent-orgs'
import { passwordEncryption } from '@/app/api/server/encryption'
import { redirect } from 'next/navigation'

/**
 * Server-only access to the platform's operator (platform-admin) APIs.
 *
 * Every call exchanges the httpOnly NextAuth session cookie for a short-lived
 * access token on the server. Access and refresh tokens never reach the
 * browser for the /admin screens.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const PLATFORM_ADMIN_ROLE = 'platform_admin'
const DEFAULT_PAGE_SIZE = 10

interface SessionTokens {
  token: string
  refreshToken: string
}

interface ApiEnvelope<T> {
  data?: T
}

interface SessionDetails {
  sessionToken?: string
  refreshToken?: string
}

interface RefreshedTokens {
  access_token?: string
}

interface InvitationsPayload {
  data?: AdminInvitation[]
  totalPages?: number
}

const loadSessionTokens = cache(async (): Promise<SessionTokens | null> => {
  if (!BASE_URL) {
    return null
  }

  const session = await getServerSession(authOptions)
  if (!session?.sessionId) {
    return null
  }

  try {
    // The platform decrypts with JSON.parse, so the session id must be
    // JSON-encoded before encryption. Encrypting the raw string yields a
    // payload the backend rejects with 400 Invalid Credentials.
    const encryptedSessionId = passwordEncryption(
      JSON.stringify(session.sessionId),
    )
    const response = await fetch(
      `${BASE_URL}${apiRoutes.auth.fetchSessionDetails}?sessionId=${encodeURIComponent(encryptedSessionId)}`,
      { cache: 'no-store' },
    )

    if (!response.ok) {
      return null
    }

    const body = (await response.json()) as ApiEnvelope<SessionDetails>
    const token = body?.data?.sessionToken
    const refreshToken = body?.data?.refreshToken

    return token && refreshToken ? { token, refreshToken } : null
  } catch {
    return null
  }
})

const refreshAccessToken = async (
  refreshToken: string,
): Promise<string | null> => {
  if (!BASE_URL) {
    return null
  }

  try {
    const response = await fetch(`${BASE_URL}${apiRoutes.auth.refreshToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const body = (await response.json()) as ApiEnvelope<RefreshedTokens>
    return body?.data?.access_token ?? null
  } catch {
    return null
  }
}

const platformFetch = async (
  path: string,
  init: RequestInit = {},
): Promise<Response | null> => {
  if (!BASE_URL) {
    return null
  }

  const tokens = await loadSessionTokens()
  if (!tokens) {
    return null
  }

  const send = (token: string): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

  const response = await send(tokens.token)
  if (response.status !== 401) {
    return response
  }

  const refreshedToken = await refreshAccessToken(tokens.refreshToken)
  return refreshedToken ? send(refreshedToken) : response
}

interface PlatformProfile {
  firstName?: string
  lastName?: string
  email?: string
  userOrgRoles?: { orgRole?: { name?: string } }[]
}

// Cached per request so the layout, page and server actions that run together
// share a single profile lookup.
const loadPlatformProfile = cache(async (): Promise<PlatformProfile | null> => {
  const response = await platformFetch(apiRoutes.users.userProfile)
  if (!response?.ok) {
    return null
  }

  try {
    const body = (await response.json()) as ApiEnvelope<PlatformProfile>
    return body?.data ?? null
  } catch {
    return null
  }
})

const holdsPlatformAdminRole = cache(async (): Promise<boolean> => {
  const profile = await loadPlatformProfile()
  const roles = profile?.userOrgRoles

  return (
    Array.isArray(roles) &&
    roles.some((item) => item?.orgRole?.name === PLATFORM_ADMIN_ROLE)
  )
})

/**
 * v2.3.0's `/orgs` endpoint returns only organizations where the caller holds
 * a specific org role. Platform-admin is not an org role, so an operator who
 * also belongs to organizations can use those roles to discover their agents.
 */
const getAccessibleOrgRoles = cache(async (): Promise<string[]> => {
  const profile = await loadPlatformProfile()
  const roles = new Set<string>()

  for (const item of profile?.userOrgRoles ?? []) {
    const name = item?.orgRole?.name?.trim()
    if (name && name !== PLATFORM_ADMIN_ROLE) {
      roles.add(name)
    }
  }

  return Array.from(roles)
})

/**
 * Display identity for the signed-in platform operator, resolved from the same
 * cached profile lookup used by the authorization guard.
 */
export const getPlatformAdminIdentity = async (): Promise<{
  name?: string
  email?: string
} | null> => {
  const profile = await loadPlatformProfile()
  if (!profile) {
    return null
  }

  const name = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return { name: name || profile.email, email: profile.email }
}

/**
 * Returns the current session only when the user is a platform admin.
 *
 * The JWT claim is a UI hint, not an authorization source: the live role is
 * checked on every request so revoking `platform_admin` takes effect
 * immediately instead of waiting for the token to be re-issued.
 */
export const getPlatformAdminSession = async (): Promise<Session | null> => {
  const session = await getServerSession(authOptions)
  if (!session?.sessionId) {
    return null
  }

  return (await holdsPlatformAdminRole()) ? session : null
}

export const requirePlatformAdmin = async (): Promise<void> => {
  const session = await getPlatformAdminSession()
  if (!session) {
    redirect('/dashboard')
  }
}

export const getDashboardSummary =
  async (): Promise<AdminDashboardSummary | null> => {
    const response = await platformFetch(
      apiRoutes.platformAdmin.dashboardSummary,
    )
    if (!response?.ok) {
      return null
    }

    try {
      const body = (await response.json()) as ApiEnvelope<
        Partial<AdminDashboardSummary>
      >
      const data = body?.data

      return {
        ecosystem: Number(data?.ecosystem ?? 0),
        invitations: Number(data?.invitations ?? 0),
        activeOrgs: Number(data?.activeOrgs ?? 0),
      }
    } catch {
      return null
    }
  }

export const getEcosystemStatus = async (): Promise<boolean | null> => {
  const response = await platformFetch(apiRoutes.platformAdmin.ecosystemStatus)
  if (!response?.ok) {
    return null
  }

  try {
    const body = (await response.json()) as ApiEnvelope<unknown>
    return typeof body?.data === 'boolean' ? body.data : null
  } catch {
    return null
  }
}

export const getPlatformInvitations = async ({
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  search = '',
}: {
  page: number
  pageSize?: number
  search?: string
}): Promise<AdminInvitationPage> => {
  const query = new URLSearchParams({
    pageNumber: String(Math.max(1, page)),
    pageSize: String(Math.max(1, pageSize)),
  })
  if (search) {
    query.set('search', search)
  }

  const response = await platformFetch(
    `${apiRoutes.platformAdmin.invitations}?${query.toString()}`,
  )
  if (!response?.ok) {
    return { data: [], totalPages: 1 }
  }

  try {
    const body = (await response.json()) as ApiEnvelope<InvitationsPayload>
    const data = Array.isArray(body?.data?.data) ? body.data.data : []

    return {
      data,
      totalPages: Math.max(1, Number(body?.data?.totalPages ?? 1)),
    }
  } catch {
    return { data: [], totalPages: 1 }
  }
}

export const inviteEcosystemOwner = async (email: string): Promise<void> => {
  const response = await platformFetch(apiRoutes.platformAdmin.invitations, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  if (!response?.ok) {
    throw new Error('Unable to create the ecosystem invitation')
  }
}

export const updateEcosystemStatus = async (
  isEcosystemEnabled: boolean,
): Promise<void> => {
  const response = await platformFetch(
    apiRoutes.platformAdmin.updateEcosystemConfig,
    {
      method: 'PUT',
      body: JSON.stringify({ isEcosystemEnabled }),
    },
  )

  if (!response?.ok) {
    throw new Error('Unable to update the ecosystem setting')
  }
}

const CLOUD_WALLET_STATUS_COOKIE = 'studio_cloud_base_wallet_status'
const MAX_COOKIE_ENDPOINT_LENGTH = 2048
const AGENT_TOKEN_PATH = '/agent/token'
const AGENT_TOKEN_TIMEOUT_MS = 8000

/**
 * The platform allows exactly one base wallet, so a second configuration
 * attempt returns 409. Keeping this as a typed error lets the UI explain the
 * conflict without exposing raw backend details.
 */
export class CloudBaseWalletConflictError extends Error {
  constructor() {
    super('A cloud base wallet is already configured')
    this.name = 'CloudBaseWalletConflictError'
  }
}

/**
 * Platform v2.3.0 has no read endpoint for the base wallet. Studio keeps a
 * non-secret UI hint in an httpOnly cookie after a successful configuration or
 * a 409 conflict. The cookie is never used for authorization; the backend's
 * conflict response is the authoritative check.
 */
const readCloudBaseWalletStatus = async (): Promise<CloudBaseWalletStatus> => {
  const raw = (await cookies()).get(CLOUD_WALLET_STATUS_COOKIE)?.value
  if (!raw) {
    return { configured: false }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CloudBaseWalletStatus> | null
    if (!parsed || parsed.configured !== true) {
      return { configured: false }
    }

    const agentEndpoint =
      typeof parsed.agentEndpoint === 'string' &&
      parsed.agentEndpoint.length <= MAX_COOKIE_ENDPOINT_LENGTH
        ? parsed.agentEndpoint
        : undefined
    const configuredAt =
      typeof parsed.configuredAt === 'string' &&
      !Number.isNaN(Date.parse(parsed.configuredAt))
        ? parsed.configuredAt
        : undefined

    return {
      configured: true,
      ...(agentEndpoint ? { agentEndpoint } : {}),
      ...(configuredAt ? { configuredAt } : {}),
    }
  } catch {
    return { configured: false }
  }
}

export const getCloudBaseWalletStatus = readCloudBaseWalletStatus

/**
 * Builds the non-secret dropdown candidates. The allowlist and the stored
 * endpoint always work; org agents appear only for admins who also hold an org
 * role in v2.3.0. A future platform discovery API can replace these lookups.
 */
export const getKnownAgentOptions = async (
  cloudEndpoint?: string,
): Promise<KnownAgentOption[]> => {
  if (!(await getPlatformAdminSession())) {
    return []
  }

  const [allowlist, orgs] = await Promise.all([
    Promise.resolve(parseKnownAgentAllowlist(process.env.STUDIO_KNOWN_AGENTS)),
    loadAccessibleOrgAgents({
      fetcher: platformFetch,
      roles: await getAccessibleOrgRoles(),
    }),
  ])

  return buildKnownAgentOptions({ cloudEndpoint, allowlist, orgs })
}

export const rememberCloudBaseWalletConfigured = async (
  details: Pick<CloudBaseWalletStatus, 'agentEndpoint'> = {},
): Promise<CloudBaseWalletStatus> => {
  const current = await readCloudBaseWalletStatus()
  const trimmedEndpoint = details.agentEndpoint?.trim()
  const status: CloudBaseWalletStatus = {
    configured: true,
    ...(trimmedEndpoint
      ? { agentEndpoint: trimmedEndpoint.slice(0, MAX_COOKIE_ENDPOINT_LENGTH) }
      : current.agentEndpoint
        ? { agentEndpoint: current.agentEndpoint }
        : {}),
    ...(current.configuredAt
      ? { configuredAt: current.configuredAt }
      : { configuredAt: new Date().toISOString() }),
  }

  const cookieStore = await cookies()
  cookieStore.set(CLOUD_WALLET_STATUS_COOKIE, JSON.stringify(status), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return status
}

/**
 * Mints the base-agent JWT at configuration time. The raw authorization key
 * is used only for this request: it is never stored in Studio, returned to the
 * browser, or forwarded to the platform's base-wallet endpoint.
 */
export class AgentTokenFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AgentTokenFetchError'
  }
}

const buildAgentTokenUrl = (agentEndpoint: string): URL | null => {
  try {
    const url = new URL(AGENT_TOKEN_PATH, agentEndpoint)
    url.search = ''
    url.hash = ''
    return url
  } catch {
    return null
  }
}

export const fetchAgentAuthToken = async (
  agentEndpoint: string,
  authorizationKey: string,
): Promise<string> => {
  const url = buildAgentTokenUrl(agentEndpoint)
  if (!url) {
    throw new AgentTokenFetchError(
      'Unable to reach the agent or fetch its token.',
    )
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: authorizationKey,
      },
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(AGENT_TOKEN_TIMEOUT_MS),
    })

    if (response.status === 401 || response.status === 403) {
      throw new AgentTokenFetchError(
        'The agent rejected the authorization key.',
      )
    }

    if (!response.ok) {
      throw new AgentTokenFetchError('The agent did not return a token.')
    }

    const body = (await response.json()) as { token?: unknown }
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    if (!token) {
      throw new AgentTokenFetchError('The agent did not return a token.')
    }

    return token
  } catch (error) {
    if (error instanceof AgentTokenFetchError) {
      throw error
    }

    throw new AgentTokenFetchError(
      'Unable to reach the agent or fetch its token.',
    )
  }
}

export const configureCloudBaseWallet = async (
  config: CloudBaseWalletConfigInput,
): Promise<CloudBaseWalletSummary> => {
  const response = await platformFetch(
    apiRoutes.platformAdmin.configureCloudBaseWallet,
    {
      method: 'POST',
      body: JSON.stringify(config),
    },
  )

  if (response?.status === 409) {
    throw new CloudBaseWalletConflictError()
  }

  if (!response?.ok) {
    throw new Error('Unable to configure the cloud base wallet')
  }

  try {
    const body = (await response.json()) as ApiEnvelope<CloudBaseWalletSummary>
    const data = body?.data

    // Only copy fields the UI can display. Secrets are never returned.
    return {
      ...(typeof data?.id === 'string' ? { id: data.id } : {}),
      ...(typeof data?.email === 'string' ? { email: data.email } : {}),
      ...(typeof data?.type === 'string' ? { type: data.type } : {}),
      ...(typeof data?.userId === 'string' ? { userId: data.userId } : {}),
      ...(typeof data?.agentEndpoint === 'string'
        ? { agentEndpoint: data.agentEndpoint }
        : {}),
    }
  } catch {
    return {}
  }
}
