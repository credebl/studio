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
import { EcosystemOrgStatus } from '@/common/enums'
import { EcosystemMemberInvitation, EcosystemRoles } from '@/features/common/enum'

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
  const url = `${apiRoutes.Ecosystem.ecosystemInvitationStatus}`

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
  options: IPagination,
  role: EcosystemRoles
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.memberInvitations}?pageNumber=${options.pageNumber + 1}&pageSize=${options.pageSize}&orgId=${orgId}${ecosystemId && `&ecosystemId=${ecosystemId}`}&search=${options.searchTerm}&role=${role}`

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


export const inviteMemberToEcosystem = async (
  payload: {
      orgId: string,
      ecosystemId: string
  }
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.inviteMember}`

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


export const getEcosystemMembers = async (
  ecosystemId : string,
  options: IPagination
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.ecosystemMembers}?pageNumber=${options.pageNumber + 1}&pageSize=${options.pageSize}&ecosystemId=${ecosystemId}&search=${options.searchTerm}`

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


export const updateMemberStatus = async (
  status: EcosystemOrgStatus,
  payload: {
      orgIds: string[],
      ecosystemId: string
  }
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.updateMemberStatus}?status=${status}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload,
    config,
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteEcosystemMember = async (
  payload: {
      orgIds: string[],
      ecosystemId: string
  }
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.deleteMember}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload,
    config,
  }
  console.log("axios payload",axiosPayload)

  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}


export const acceptRejectMemberInvitation = async (
  status: EcosystemMemberInvitation, 
  payload: {
      orgId: string,
      ecosystemId: string
  }
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.ecosystemInvitationStatus}?status=${status}`

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