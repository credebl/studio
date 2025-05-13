import {
  IDedicatedAgentConfiguration,
  IUpdatePrimaryDid,
} from '@/features/organization/components/interfaces/organization'
import { axiosGet, axiosPost, axiosPut } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const getLedgersPlatformUrl = async (
  indyNamespace: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.Platform.getLedgerPlatformUrl}${indyNamespace}`,
    config: getHeaderConfigs(),
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const spinupDedicatedAgent = async (
  data: object,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentDedicatedSpinup}`
  const payload = data

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

export const setAgentConfigDetails = async (
  data: IDedicatedAgentConfiguration,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.setAgentConfig}`
  const payload = data

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

export const spinupSharedAgent = async (
  data: object,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentSharedSpinup}`
  const payload = data

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

export const createDid = async (
  orgId: string,
  data: object,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.createDid}`
  const payload = data

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

export const getLedgerConfig = async (): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}${apiRoutes.Agent.getLedgerConfig}`
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

export const getLedgers = async (): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Platform.getLedgers}`
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

export const createPolygonKeyValuePair = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.createPolygonKeys}`
  const config = getHeaderConfigs()
  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getDids = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didList}`
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

export const updatePrimaryDid = async (
  orgId: string,
  payload: IUpdatePrimaryDid,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.primaryDid}`

  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
