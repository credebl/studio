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
  const setSessionDetails = (sessionDetails: any) => {
    if (sessionDetails && sessionDetails?.accessToken) {
      dispatch(setToken(sessionDetails?.accessToken))
    }

    if (sessionDetails && sessionDetails?.refreshToken) {
      dispatch(setRefreshToken(sessionDetails?.refreshToken))
    }
  }
  const fetchSeesionDetails = async () => {
    try {
      let resp = await fetch(`${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.fetchSessionDetails}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: 'include'
        }
      )
      console.log('resp', resp)
      setSessionDetails(resp)


    } catch (error) {

    }
  }

  useEffect(() => {
    console.log('Session', session)
    if (session?.user) {
      fetchSeesionDetails()
    } else {
      console.log('session not found')
    }

  }, [session?.user])

  return <>{children}</>
}
