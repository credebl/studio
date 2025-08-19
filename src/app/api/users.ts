import { axiosGet, axiosPut } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import apiRoutes from './apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

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
