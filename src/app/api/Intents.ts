import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
} from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

interface IPagination {
  page: number
  itemPerPage: number
  search?: string
  sortBy?: string
  sortingOrder?: string
}

export const getAllIntents = async (
  ecosystemId: string,
  options: IPagination,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.intents.root}${apiRoutes.Ecosystem.root}/${ecosystemId}?pageSize=${options.itemPerPage}&pageNumber=${options.page}&search=${options.search}&sortBy=${options.sortingOrder}&sortField=${options.sortBy}`
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

export const createIntent = async (
  ecosystemId: string,
  payload: { name: string; description: string },
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.intents.root}${apiRoutes.Ecosystem.root}/${ecosystemId}`
  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updateIntent = async (
  ecosystemId: string,
  intentId: string,
  data: { name: string; description: string },
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.intents.root}${apiRoutes.Ecosystem.root}/${ecosystemId}/${intentId}`

  const axiosPayload = {
    url,
    payload: data,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteIntent = async (
  ecosystemId: string,
  intentId: string,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.intents.root}${apiRoutes.Ecosystem.root}/${ecosystemId}/${intentId}`

  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
