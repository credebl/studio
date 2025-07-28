'use client'

import { setRefreshToken, setToken } from '@/lib/authSlice'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { apiRoutes } from '@/config/apiRoutes'
import { envConfig } from '@/config/envConfig'
import { passwordEncryption } from '@/app/api/Auth'
import { useAppDispatch } from '@/lib/hooks'
import { useSession } from 'next-auth/react'

const preventRedirectOnPaths = [
  '/organizations/create-organization',
  '/organizations/agent-config',
  '/organizations',
  '/users',
  '/connections',
  '/profile',
  '/developers-setting',
]

export const SessionManager = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement => {
  // const { data: session, status } = useSession()
  const { data: session, status } = useSession({
    required: false,
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const hasCheckedSession = useRef(false)

  const redirectTo = searchParams.get('redirectTo')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSessionDetails = (sessionDetails: any): void => {
    if (sessionDetails?.data?.sessionToken) {
      dispatch(setToken(sessionDetails.data.sessionToken))
    }
    if (sessionDetails?.data?.refresh_token) {
      dispatch(setRefreshToken(sessionDetails.data.refresh_token))
    }
  }

  const fetchSessionDetails = async (sessionId: string): Promise<void> => {
    try {
      const encrypted = await passwordEncryption(sessionId)
      const encoded = encodeURIComponent(encrypted)
      const resp = await fetch(
        `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.fetchSessionDetails}?sessionId=${encoded}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const data = await resp.json()
      setSessionDetails(data)
    } catch (error) {
      console.error('Failed to fetch session details:', error)
    }
  }

  // useEffect(() => {
  //   if (status === 'loading') {
  //     return
  //   }

  //   const isOnRestrictedPage = preventRedirectOnPaths.some((page) =>
  //     pathname.startsWith(page),
  //   )

  //   if (status === 'authenticated' && session?.sessionId) {
  //     fetchSessionDetails(session.sessionId as string)
  //   } else if (status === 'unauthenticated') {
  //     localStorage.removeItem('persist:root')
  //   }

  //   if (status === 'authenticated') {
  //     if (redirectTo && !isOnRestrictedPage) {
  //       window.location.href = redirectTo
  //     } else if (!redirectTo && !isOnRestrictedPage) {
  //       router.push('/dashboard')
  //     }
  //   }

  //   if (session === null) {
  //     localStorage.removeItem('persist:root')
  //   }
  // }, [session, status, redirectTo, router, pathname])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!hasCheckedSession.current) {
      hasCheckedSession.current = true
      setTimeout(() => {
        if (status === 'authenticated' && session?.sessionId) {
          fetchSessionDetails(session.sessionId)
        } else if (status === 'unauthenticated') {
          localStorage.removeItem('persist:root')
        }

        const isOnRestrictedPage = preventRedirectOnPaths.some((page) =>
          pathname.startsWith(page),
        )

        if (status === 'authenticated') {
          if (redirectTo && !isOnRestrictedPage) {
            window.location.href = redirectTo
          } else if (!redirectTo && !isOnRestrictedPage) {
            router.push('/dashboard')
          }
        }

        if (session === null) {
          localStorage.removeItem('persist:root')
        }
      }, 500)
    }
  }, [status, session])

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  return <>{children}</>
}
