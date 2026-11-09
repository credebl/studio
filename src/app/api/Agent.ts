import {
  DidResolveSource,
  IDedicatedAgentConfiguration,
  IUpdatePrimaryDid,
} from '@/features/organization/components/interfaces/organization'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
} from '@/services/apiRequests'

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

export const createDidImportSession = async (
  orgId: string,
  method: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didImportSession}`
  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload: { method },
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

export const getAgentHealth = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.checkAgentHealth}`
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

// A DID contains colons, so it is encoded as one path segment.
const didUrl = (orgId: string, did: string): string =>
  `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didList}/${encodeURIComponent(did)}`

export const getDids = async (
  orgId: string,
  includeArchived = false,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didList}${
    includeArchived ? '?includeArchived=true' : ''
  }`
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

export const getDidDetails = async (
  orgId: string,
  did: string,
): Promise<AxiosResponse | string> => {
  try {
    return await axiosGet({
      url: didUrl(orgId, did),
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const resolveDid = async (
  orgId: string,
  did: string,
  source: DidResolveSource = 'local',
): Promise<AxiosResponse | string> => {
  try {
    return await axiosGet({
      url: `${didUrl(orgId, did)}/resolve?source=${source}`,
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getDidKms = async (
  orgId: string,
  did: string,
): Promise<AxiosResponse | string> => {
  try {
    return await axiosGet({
      url: `${didUrl(orgId, did)}/kms`,
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const archiveDid = async (
  orgId: string,
  did: string,
): Promise<AxiosResponse | string> => {
  try {
    return await axiosPut({
      url: `${didUrl(orgId, did)}/archive`,
      payload: {},
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const unarchiveDid = async (
  orgId: string,
  did: string,
): Promise<AxiosResponse | string> => {
  try {
    return await axiosPut({
      url: `${didUrl(orgId, did)}/unarchive`,
      payload: {},
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteDid = async (
  orgId: string,
  did: string,
): Promise<AxiosResponse | string> => {
  try {
    return await axiosDelete({
      url: didUrl(orgId, did),
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
