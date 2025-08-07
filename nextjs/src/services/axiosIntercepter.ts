'use client'

import { JwtPayload, jwtDecode } from 'jwt-decode'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { setRefreshToken, setToken } from '@/lib/authSlice'

import { apiRoutes } from '@/config/apiRoutes'
import { apiStatusCodes } from '@/config/CommonConstant'
import { signOut } from 'next-auth/react'
import { store } from '@/lib/store'

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

const EcosystemInstance = axios.create({
  baseURL: process.env.PUBLIC_ECOSYSTEM_BASE_URL,
})

interface RefreshTokenResponse {
  data: {
    access_token: string
    refresh_token: string
  }
}

interface jwtDataPayload extends JwtPayload {
  email?: string
  name?: string
}

// const state = store.getState()
// const refreshToken = state?.auth?.refreshToken

//Refresh Token
const refreshAccessToken = async (
  refreshToken: string,
): Promise<string | null> => {
  console.log('refreshToken', refreshToken)
  if (!refreshToken) {
    console.error('No refresh token available')
    return null
  }

  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`,
      { refreshToken },
    )
    console.log('🚀 ~ refreshAccessToken ~ response:', response)

    if (
      response?.status === apiStatusCodes.API_STATUS_SUCCESS &&
      response.data?.data
    ) {
      const AccessToken = response.data.data.access_token
      const RefreshToken = response.data.data.refresh_token

      console.log("🚀 ~ refreshAccessToken ~ AccessToken:", AccessToken)
      if (AccessToken && RefreshToken) {

        store.dispatch(setToken(AccessToken))
        store.dispatch(setRefreshToken(RefreshToken))
        return AccessToken
      }
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Token refresh failed:', error.response || error.message)
    } else {
      console.error('Token refresh failed:', error)
    }
    return null
  }
}

export function logoutAndRedirect(): void {
  const rootKey = 'persist:root'

  if (localStorage.getItem(rootKey)) {
    localStorage.removeItem(rootKey)

    const interval = setInterval(() => {
      if (!localStorage.getItem(rootKey)) {
        clearInterval(interval)
        void signOut({ callbackUrl: '/sign-in' })
      }
    }, 100)
  } else {
    void signOut({ callbackUrl: '/sign-in' })
  }
}

function isTokenExpired(accessToken: string, refreshToken: string): boolean {
  try {
    const currentTime = Math.floor(Date.now() / 1000)

    // Decode and check refresh token
    const { exp: refreshExp } = jwtDecode<JwtPayload>(refreshToken)
    console.log('🚀 ~ isTokenExpired ~ refreshExp:', refreshExp)
    if (refreshExp && refreshExp < currentTime) {
      console.warn('Refresh token expired. Logout the user.')
      logoutAndRedirect()
    }

    // Decode and check access token
    const { exp: accessExp } = jwtDecode<JwtPayload>(accessToken)
    console.log('checking the access token expiration')
    console.log('access token:::', accessExp ? accessExp < currentTime : false)
    return accessExp ? accessExp < currentTime : false
  } catch (error) {
    console.error('Error decoding token:', error)
    return true // Consider token expired if decoding fails
  }
}

// REQUEST INTERCEPTOR
instance.interceptors.request.use(
  async (config) => {
    const { auth } = store.getState()
    const token = auth?.token
    const refreshToken = auth?.refreshToken
    let isRequested = false
    if (!token || !refreshToken) return config

    let accessToken: string | null = token

    if (isTokenExpired(token, refreshToken)&& !isRequested) {
      console.log('\n\n-----in side if-----------------\n\n')
      isRequested= true
      accessToken = await refreshAccessToken(refreshToken)
    }

    return {
      ...config,
      headers: new axios.AxiosHeaders({
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      }),
    }
  },
  (error) => Promise.reject(error),
)

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }
    const isPasswordCheckRoute = originalRequest?.url?.includes(
      apiRoutes.auth.passkeyUserDetails,
    )

    // Automatically logout on 401
    // if (
    //   error.response?.status === apiStatusCodes.API_STATUS_UNAUTHORIZED &&
    //   !originalRequest?._retry &&
    //   !isPasswordCheckRoute
    // ) {
    //   originalRequest._retry = true

    //   const newAccessToken = await refreshAccessToken()
    //   if (newAccessToken && originalRequest.headers) {
    //     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
    //     return instance(originalRequest)
    //   }

    //   if (typeof window !== 'undefined') {
    //     logoutAndRedirect()
    //   }
    // }

    return Promise.reject(error)
  },
)

export { instance, EcosystemInstance }
