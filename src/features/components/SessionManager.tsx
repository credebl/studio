'use client'

import { setRefreshToken, setSessionId, setToken } from '@/lib/authSlice'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { apiRoutes } from '@/config/apiRoutes'
import { envConfig } from '@/config/envConfig'
import { passwordEncryption } from '@/app/api/Auth'
import { useAppDispatch } from '@/lib/hooks'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const preventRedirectOnPaths = [
  '/create-organization',
  '/agent-config',
  '/organizations',
  '/users',
  '/connections',
  '/profile',
  '/developers-setting',
  '/schemas',
  '/invitations',
  '/delete-organization',
  '/agent-config',
  '/credentials',
  '/verification',
]
const excludeRouteForSessionCheck = ['/verify-email-success', '/reset-password']

export const SessionManager = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement => {
  const { data: session, status } = useSession({
    required: false,
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  const redirectTo = searchParams.get('redirectTo')
  const clientAlias = searchParams.get('clientAlias')

  const setSessionDetails = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionDetails: any,
    redirectTo: string | null,
  ): void => {
    const isOnRestrictedPage = preventRedirectOnPaths.some((page) =>
      pathname.startsWith(page),
    )
    if (sessionDetails?.data?.sessionToken) {
      dispatch(setToken(sessionDetails.data.sessionToken))
    }
    if (sessionDetails?.data?.refreshToken) {
      dispatch(setRefreshToken(sessionDetails.data.refreshToken))
    }
    if (redirectTo && !isOnRestrictedPage) {
      window.location.href = redirectTo
    } else if (!redirectTo && !isOnRestrictedPage) {
      router.push('/dashboard')
    }
  }

  const fetchSessionDetails = async (
    sessionId: string,
    redirectTo: string | null,
  ): Promise<void> => {
    try {
      const encrypted = passwordEncryption(sessionId)
      const encoded = encodeURIComponent(encrypted)
      const resp = await fetch(
        `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.fetchSessionDetails}?sessionId=${encoded}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const data = await resp.json()
      // eslint-disable-next-line
      setSessionDetails(data, redirectTo)
    } catch (error) {
      console.error('Failed to fetch session details:', error)
      throw error
    }
  }

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    setTimeout(() => {
      if (status === 'authenticated' && session?.sessionId) {
        fetchSessionDetails(session.sessionId, redirectTo)
        dispatch(setSessionId(session?.sessionId))
      } else if (status === 'unauthenticated' || session === null) {
        const isIgnoreSessionCheck = excludeRouteForSessionCheck.some((page) =>
          pathname.startsWith(page),
        )
        if (!isIgnoreSessionCheck) {
          localStorage.removeItem('persist:root')
          const signInUrl =
            redirectTo && clientAlias
              ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}&clientAlias=${clientAlias}`
              : '/sign-in'
          router.push(signInUrl)
        }
      }
    }, 500)
  }, [status, session])

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  return <>{children}</>
}
