'use client'

import { JwtPayload, jwtDecode } from 'jwt-decode'
import axios, { AxiosError } from 'axios'

import { apiStatusCodes } from '@/config/CommonConstant'
import { generateAccessToken } from '@/utils/session'
import { store } from '@/lib/store'

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

const EcosystemInstance = axios.create({
  baseURL: process.env.PUBLIC_ECOSYSTEM_BASE_URL,
})

export async function logoutAndRedirect(): Promise<void> {
  generateAccessToken()
}

instance.interceptors.request.use(
  async (config) => {
    if (config.url?.includes('/refresh-token')) {
      return config
    }
    const { auth } = store.getState()
    const { token } = auth
    try {
      const currentTime = Math.floor(Date.now() / 1000)
      const { refreshToken } = auth
      const refreshTokenExp = jwtDecode<JwtPayload>(refreshToken).exp
      const isRefreshTokenExpired = refreshTokenExp
        ? refreshTokenExp - currentTime < 10
        : true
      const { exp: accessExp } = jwtDecode<JwtPayload>(token)
      const isExpired = accessExp ? accessExp - currentTime < 10 : true
      if (isExpired && !isRefreshTokenExpired) {
        await generateAccessToken()
        const newToken = store.getState().auth?.token
        if (newToken) {
          return {
            ...config,
            headers: new axios.AxiosHeaders({
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            }),
          }
        }
      }
      if (isRefreshTokenExpired) {
        await generateAccessToken()
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    }
    return {
      ...config,
      headers: new axios.AxiosHeaders({
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }),
    }
  },
  async (error) => {
    if (error.response?.status === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
      if (typeof window !== 'undefined') {
        await logoutAndRedirect()
      }
    }
    return Promise.reject(error)
  },
)

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) =>
    // if (error.response?.status === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
    //   if (typeof window !== 'undefined') {
    //     await logoutAndRedirect()
    //   }
    // }

    // const originalRequest = error.config as AxiosRequestConfig & {
    //   _retry?: boolean
    // }
    // const isPasswordCheckRoute = originalRequest?.url?.includes(
    //   apiRoutes.auth.passkeyUserDetails,
    // )

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
    //

    Promise.reject(error),
)

export { instance, EcosystemInstance }
