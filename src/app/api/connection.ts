import { axiosDelete, axiosGet } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { ConnectionResponse } from '@/features/connections/types/connections-interface'
import { apiRoutes } from '@/config/apiRoutes'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IConnectionListAPIParameter {
  itemPerPage: number
  page: number
  search: string
  sortBy: string
  sortingOrder: string
  filter?: string
}

export interface IConnectionListAPIParameterAllSearch {
  itemPerPage: number
  page: number
  search: string
  sortBy: string
  sortingOrder: string
  filter?: string
  allSearch: string
}

export const getConnectionsByOrg = async ({
  orgId,
  page,
  itemPerPage,
  search,
  sortBy,
  sortingOrder,
}: IConnectionListAPIParameter & {
  orgId: string
}): Promise<ConnectionResponse | void> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getAllConnections}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`

  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    const connectionList = await axiosGet(axiosPayload)
    const { data } = connectionList
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      if (!data.data) {
        throw new Error('Error fetching connections', data.error)
      }
      return data.data
    }
    throw new Error('Error fetching connection list')
  } catch (error) {
    const err = error as Error
    // eslint-disable-next-line no-console
    console.log('Error fetching connections::', err.message ?? '')
  }
}

export const deleteConnectionRecords = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteConnections}`

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
