import type {
  AdminDashboardSummary,
  AdminInvitation,
  AdminInvitationPage,
} from '@/features/admin/types'
import type { Session } from 'next-auth'
import { apiRoutes } from '@/config/apiRoutes'
import { authOptions } from '@/utils/authOptions'
import { cache } from 'react'
import { getServerSession } from 'next-auth/next'
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
    const encryptedSessionId = passwordEncryption(session.sessionId)
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

const holdsPlatformAdminRole = async (): Promise<boolean> => {
  const response = await platformFetch(apiRoutes.users.userProfile)
  if (!response?.ok) {
    return false
  }

  try {
    const body = (await response.json()) as ApiEnvelope<{
      userOrgRoles?: { orgRole?: { name?: string } }[]
    }>
    const roles = body?.data?.userOrgRoles

    return (
      Array.isArray(roles) &&
      roles.some((item) => item?.orgRole?.name === PLATFORM_ADMIN_ROLE)
    )
  } catch {
    return false
  }
}

/**
 * Returns the current session only when the user is a platform admin.
 * Falls back to a live profile check for sessions minted before the
 * isPlatformAdmin claim was added to the NextAuth JWT.
 */
export const getPlatformAdminSession = async (): Promise<Session | null> => {
  const session = await getServerSession(authOptions)
  if (!session?.sessionId) {
    return null
  }

  if (session.isPlatformAdmin) {
    return session
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
