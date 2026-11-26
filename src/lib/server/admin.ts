import type {
  AdminDashboardSummary,
  AdminInvitation,
  AdminInvitationPage,
} from '@/features/admin/types'
import { type ApiEnvelope, platformFetch } from './platform'
import type { Session } from 'next-auth'
import { apiRoutes } from '@/config/apiRoutes'
import { authOptions } from '@/utils/authOptions'
import { cache } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

/**
 * Server-only access to the platform's operator (platform-admin) APIs.
 *
 * Every call exchanges the httpOnly NextAuth session cookie for a short-lived
 * access token on the server. Access and refresh tokens never reach the
 * browser for the /admin screens.
 */

const PLATFORM_ADMIN_ROLE = 'platform_admin'
const DEFAULT_PAGE_SIZE = 10

interface InvitationsPayload {
  data?: AdminInvitation[]
  totalPages?: number
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
