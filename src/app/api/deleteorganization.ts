import { axiosDelete, axiosGet } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const getOrganizationReferences = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}${apiRoutes.organizations.getOrgReferences}/${orgId}`

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

export const deleteVerificationRecords = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteVerifications}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }
  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteIssuanceRecords = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteIssaunce}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }
  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteOrganizationWallet = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.deleteWallet}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }
  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteOrganization = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}`
  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }
  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
