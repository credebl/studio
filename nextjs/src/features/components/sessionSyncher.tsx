'use client'

import { JSX, useEffect } from 'react'
import { setAuthToken, setRefreshToken, setToken } from '@/lib/authSlice'

import { useAppDispatch } from '@/lib/hooks'
import { useSession } from 'next-auth/react'

export const SessionSyncer = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element => {
  const { data: session } = useSession()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (session && session?.accessToken) {
      dispatch(setAuthToken(session?.accessToken))
      dispatch(setToken(session?.accessToken))
    }

    if (session && session?.refreshToken) {
      dispatch(setRefreshToken(session?.refreshToken))
    }
  }, [session?.accessToken, session?.refreshToken])

  return <>{children}</>
}
