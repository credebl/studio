import { axiosDelete, axiosGet } from '@/services/apiRequests'

import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IConnectionListAPIParameter {
  itemPerPage: number
  page: number
  search: string
  sortBy: string
  sortingOrder: string
  filter?: string
}

export const getConnectionsByOrg = async ({
  orgId,
  page,
  itemPerPage,
  search,
  sortBy,
  sortingOrder,
}: IConnectionListAPIParameter & { orgId: string }) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getAllConnections}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`

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

export const deleteConnectionRecords = async (orgId: string) => {
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
