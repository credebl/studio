import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  ecosystemAxiosPost,
} from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

interface IPagination {
pageSize: number,
pageNumber: number,
searchTerm?: string,
sortBy?: string,
sortField?: string,
}

export const getEcosystemsForLead = async (
orgId : string,
options: IPagination
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.ecosystems}?pageNumber=${options.pageNumber + 1}&pageSize=${options.pageSize}&orgId=${orgId}&search=${options.searchTerm}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}


export const createEcosystem = async (
orgId : string,
payload: {
    name: string,
    description: string
}
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.ecosystems}?&orgId=${orgId}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload,
    config,
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getEcosystemCreationInvitation = async (): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.ecosystemCreationInvite}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getEcosystemMemberInvitations = async (
  orgId : string,
  ecosystemId: string,
  options: IPagination
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.memberInvitations}?pageNumber=${options.pageNumber + 1}&pageSize=${options.pageSize}&orgId=${orgId}&ecosystemId=${ecosystemId}&search=${options.searchTerm}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}


export const getOrganizationsForInvite = async (
  orgId : string,
  options: IPagination
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.getAllPlatformOrgs.replace(':orgId',orgId)}?pageNumber=${options.pageNumber + 1}&pageSize=${options.pageSize}&orgId=${orgId}&search=${options.searchTerm}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}