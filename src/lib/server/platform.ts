import { apiRoutes } from '@/config/apiRoutes'
import { authOptions } from '@/utils/authOptions'
import { cache } from 'react'
import { getServerSession } from 'next-auth/next'
import { passwordEncryption } from '@/app/api/server/encryption'

/**
 * Server-only helpers for calling the platform API with the signed-in user's
 * httpOnly NextAuth session. Access and refresh tokens never reach the browser.
 *
 * Shared by the platform-admin and holder consoles so both use the same token
 * exchange, refresh and fail-closed behaviour.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export interface SessionTokens {
  token: string
  refreshToken: string
}

export interface ApiEnvelope<T> {
  data?: T
}

interface SessionDetails {
  sessionToken?: string
  refreshToken?: string
  /** Platform database user id; the NextAuth session user id is not this value. */
  userId?: string
}

interface RefreshedTokens {
  access_token?: string
}

const loadSessionDetails = cache(async (): Promise<SessionDetails | null> => {
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
    return body?.data ?? null
  } catch {
    return null
  }
})

export const loadSessionTokens = cache(
  async (): Promise<SessionTokens | null> => {
    const details = await loadSessionDetails()
    const token = details?.sessionToken
    const refreshToken = details?.refreshToken

    return token && refreshToken ? { token, refreshToken } : null
  },
)

/** Resolve the platform user id needed by user-scoped APIs such as primary DID. */
export const loadSessionUserId = cache(
  async (): Promise<string | null> =>
    (await loadSessionDetails())?.userId?.trim() || null,
)

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

export const platformFetch = async (
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
