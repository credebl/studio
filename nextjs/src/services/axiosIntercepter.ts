'use client'

import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { setAuthToken, setRefreshToken } from '@/lib/authSlice'

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

//Refresh Token
const refreshAccessToken = async (): Promise<string | null> => {
  const state = store.getState()
  const refreshToken = state?.auth?.refreshToken

  if (!refreshToken) {
    console.error('No refresh token available')
    return null
  }

  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`,
      { refreshToken },
    )

    if (
      response?.status === apiStatusCodes.API_STATUS_CREATED &&
      response.data?.data
    ) {
      const AccessToken = response.data.data.access_token
      const RefreshToken = response.data.data.refresh_token

      if (AccessToken && RefreshToken) {
        store.dispatch(setAuthToken(AccessToken))
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

// REQUEST INTERCEPTOR
instance.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state?.auth?.authToken

    if (token) {
      const updatedConfig = {
        ...config,
        headers: new axios.AxiosHeaders({
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }),
      }
      return updatedConfig
    }

    return config
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

    // Automatically logout on 401
    if (
      error.response?.status === apiStatusCodes.API_STATUS_UNAUTHORIZED &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true

      const newAccessToken = await refreshAccessToken()
      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return instance(originalRequest)
      }

      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/auth/sign-in' })
      }
    }

    return Promise.reject(error)
  },
)

export { instance, EcosystemInstance }
