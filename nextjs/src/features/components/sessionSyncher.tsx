'use client'

import { JSX, useEffect } from 'react'
import { setRefreshToken, setToken } from '@/lib/authSlice'

import { apiRoutes } from '@/config/apiRoutes'
import { envConfig } from '@/config/envConfig'
import { useAppDispatch } from '@/lib/hooks'
import { useSession } from 'next-auth/react'

export const SessionSyncer = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element => {
  const { data: session } = useSession()
  const dispatch = useAppDispatch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSessionDetails = (sessionDetails: any): void => {
    if (sessionDetails && sessionDetails?.accessToken) {
      dispatch(setToken(sessionDetails?.accessToken))
    }

    if (sessionDetails && sessionDetails?.refreshToken) {
      dispatch(setRefreshToken(sessionDetails?.refreshToken))
    }
  }
  const fetchSeesionDetails = async (): Promise<void> => {
    try {
      await fetch(
        `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.fetchSessionDetails}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      )
      // setSessionDetails(resp)
    } catch (error) {
      console.error('error::', error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSeesionDetails()
      setSessionDetails(session)
    } else {
      console.error('user not found')
    }
  }, [session?.user])

  return <>{children}</>
}
