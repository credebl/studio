import { axiosGet, axiosPost, axiosPut } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import apiRoutes from './apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'
import { setToken } from '@/lib/authSlice'
import { store } from '@/lib/store'

export interface IPlatformSetting {
  externalIp: string
  lastInternalId: string
  sgApiKey: string
  emailFrom: string
  apiEndPoint: string
}

export const getUserActivity = async (
  limit: number,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.users.recentActivity}?limit=${limit}`
  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getPlatformSettings = async (): Promise<
  AxiosResponse | string
> => {
  const url = `${apiRoutes.users.platformSettings}`
  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updatePlatformSettings = async (
  payload: IPlatformSetting,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.users.platformSettings}`
  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
    payload,
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const generateSessionToken = async (): Promise<
  AxiosResponse | string
> => {
  const state = store.getState()
  const refreshToken = state?.auth?.refreshToken
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`
  const payload = {
    refreshToken,
  }
  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    const data = await axiosPost(axiosPayload)
    if (data?.data?.data) {
      store.dispatch(setToken(data.data.data.access_token))
    }
    return data
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
