'use client'

import { JwtPayload, jwtDecode } from 'jwt-decode'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { setRefreshToken, setToken } from '@/lib/authSlice'
import { signOut, useSession } from 'next-auth/react'

import { apiRoutes } from '@/config/apiRoutes'
import { apiStatusCodes } from '@/config/CommonConstant'
import { envConfig } from '@/config/envConfig'
import { store } from '@/lib/store'
import { useAppSelector } from '@/lib/hooks'

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
let isRequested = false
let requestQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
  config: AxiosRequestConfig
}> = []

const waitForTokenRefresh = (config: AxiosRequestConfig): Promise<any> =>
  new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, config })
  })
const processQueue = (newToken: string | null, error: any = null) => {
  requestQueue.forEach(({ resolve, reject, config }) => {
    if (newToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${newToken}`,
      }
      resolve(axios(config)) // Retry request
    } else {
      reject(error)
    }
  })
  requestQueue = []
}

// const state = store.getState()
// const refreshToken = state?.auth?.refreshToken
const broadcastMessage = () => {
  const host = window.location.hostname
  let isBroadcastSupported = false
  if (host === 'localhost' || host === '192.168.1.19') {
    isBroadcastSupported = false
  } else {
    isBroadcastSupported = true
  }
  if(isBroadcastSupported){
    const bc = new BroadcastChannel("session");
    bc.postMessage({ type: "SESSION_UPDATED" });
    bc.close();
  }else{
    localStorage.setItem("session-update", Date.now().toString());
  }
}
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
      // const sessionId= response.data.data.

      // console.log("🚀 ~ refreshAccessToken ~ AccessToken:", AccessToken)
      if (AccessToken && RefreshToken) {
        // processQueue(AccessToken)
        store.dispatch(setToken(AccessToken))
        store.dispatch(setRefreshToken(RefreshToken))
        broadcastMessage()
        // update({ isSessionUpdated: true })
        // store.dispatch(setSessionId(session?.sessionId))
        isRequested = false
        // window.location.reload()
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

export async function logoutAndRedirect(accessToken: string): Promise<void> {
  const rootKey = 'persist:root'
  // const { auth } = store.getState()

  // const payload = {
  //       sessions: [auth.sessionId],
  //     }

  //     const response = await fetch(
  //       `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.signOut}`,
  //       {
  //         method: 'POST',
  //         body: JSON.stringify(payload),
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     )

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
    console.log(
      '🚀 ~ isTokenExpired ~ refreshExp:',
      refreshExp && refreshExp <= currentTime + 10,
    )
    if (refreshExp && refreshExp <= currentTime + 10) {
      console.warn('Refresh token expired. Logout the user.')
      logoutAndRedirect(accessToken)
      return true
    }

    // Decode and check access token
    const { exp: accessExp } = jwtDecode<JwtPayload>(accessToken)
    console.log('checking the access token expiration')
    console.log(
      'access token:::',
      accessExp ? accessExp <= currentTime + 10 : false,
    )
    return accessExp ? accessExp <= currentTime + 10 : false
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
    if (!token || !refreshToken) return config

    let accessToken: string | null = token

    if (isTokenExpired(token, refreshToken)) {
      console.log('----step-1-----')
      if (!isRequested) {
        console.log('----step-2----')
        isRequested = true
        refreshAccessToken(refreshToken)
      } else {
        console.log('----for others-----')
        return {
          ...config,
          headers: new axios.AxiosHeaders({
            ...config.headers,
            Authorization: `Bearer ${accessToken}`,
          }),
        }
      }
      // if(!isRequested){
      //   try{
      //     console.log('\n\n-----in side if-----------------\n\n')
      //     isRequested = true
      //     accessToken = await refreshAccessToken(refreshToken)
      //   }catch (err) {
      //     await processQueue(null, err);
      //     throw err;
      //   } finally {
      //     isRequested = false;
      //   }
      // }else{
      //   console.log('\n\n-----in side else-----------------\n\n')
      //   return await waitForTokenRefresh(config);
      // }
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
