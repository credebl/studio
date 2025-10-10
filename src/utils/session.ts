import { setRefreshToken, setToken } from '@/lib/authSlice'

import { apiRoutes } from '@/config/apiRoutes'
import { signOut } from 'next-auth/react'
import { store } from '@/lib/store'

let refreshPromise: Promise<void> | null = null

export async function logoutUser(): Promise<void> {
  const rootKey = 'persist:root'

  if (localStorage.getItem(rootKey)) {
    localStorage.removeItem(rootKey)

    const interval = setInterval(() => {
      if (!localStorage.getItem(rootKey)) {
        clearInterval(interval)
        signOut({ callbackUrl: '/sign-in' })
      }
    }, 100)
  } else {
    signOut({ callbackUrl: '/sign-in' })
  }
}

export const generateAccessToken = async (): Promise<void> => {
  const state = store.getState()
  const refreshToken = state?.auth?.refreshToken
  if (!refreshToken) {
    logoutUser()
  }
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async (): Promise<void> => {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        },
      )

      const data = await resp.json()
      if (data.message === 'Refresh token has expired' || resp.status === 404) {
        logoutUser()
        return
      }

      if (data?.data?.access_token) {
        store.dispatch(setToken(data.data.access_token))
      }
      if (data?.data?.refresh_token) {
        store.dispatch(setRefreshToken(data.data.refresh_token))
      }
    } catch (error) {
      console.error('Failed to generate access token:', error)
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
