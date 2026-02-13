import { apiRoutes } from "@/config/apiRoutes"
import { getHeaderConfigs } from "@/config/GetHeaderConfigs"
import { axiosDelete, axiosGet, axiosPost, axiosPut } from "@/services/apiRequests"
import { AxiosResponse } from "axios"

export const getAllIntents = async ({
  page,
  itemPerPage,
  search,
  sortBy,
  sortingOrder,
  ecosystemId,
}: any): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.ecosystem.root}/${apiRoutes.intents.root}/${ecosystemId}?pageSize=${itemPerPage}&pageNumber=${page}&search=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`
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
  payload: { name: string; description: string }
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.ecosystem.root}/${apiRoutes.intents.root}/${ecosystemId}`

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
  const url = `/v1/ecosystem/intents/${ecosystemId}/${intentId}`

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
  const url = `/v1/ecosystem/intents/${ecosystemId}/${intentId}`

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
