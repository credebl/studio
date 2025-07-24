'use client'

import { JSX, useEffect } from 'react'
import { setRefreshToken, setToken } from '@/lib/authSlice'

import { apiRoutes } from '@/config/apiRoutes'
import { envConfig } from '@/config/envConfig'
import { passwordEncryption } from '@/app/api/Auth'
import { useAppDispatch } from '@/lib/hooks'
import { useSession } from 'next-auth/react'

export const SessionSyncer = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element => {
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSessionDetails = (sessionDetails: any): void => {
    if (sessionDetails && sessionDetails?.data?.sessionToken) {
      dispatch(setToken(sessionDetails?.data?.sessionToken))
    }

    if (sessionDetails && sessionDetails?.data?.refresh_token) {
      dispatch(setRefreshToken(sessionDetails?.data?.refresh_token))
    }
  }

  const fetchSeesionDetails = async (sessionId: string): Promise<void> => {
    try {
      const resp = await fetch(
        `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.fetchSessionDetails}?sessionId=${await passwordEncryption(sessionId)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const data = await resp.json()
      setSessionDetails(data)
    } catch (error) {
      console.error('error::', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.sessionId) {
      fetchSeesionDetails(session.sessionId)
    } else if (status === 'unauthenticated') {
      console.error('Session not found or unauthenticated')
    }
  }, [session?.sessionId, status])

  return <>{children}</>
}
