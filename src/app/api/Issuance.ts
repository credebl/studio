import { CredentialType, SchemaType } from '@/common/enums'
import { axiosGet, axiosPost } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IConnectionListAPIParameter {
  itemPerPage: number
  page: number
  search: string
  sortBy: string
  sortingOrder: string
  orgId: string
  filter?: string
}

export const issueCredential = async (
  data: object,
  credentialType: CredentialType | SchemaType,
  orgId: string,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueCredential}?credentialType=${credentialType}`
  const payload = data

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

export const getIssuedCredentials = async ({
  page,
  itemPerPage,
  search,
  sortBy,
  sortingOrder,
  orgId,
}: IConnectionListAPIParameter): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getIssuedCredentials}?pageSize=${itemPerPage}&pageNumber=${page}&search=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`
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

export const issueOobEmailCredential = async (
  data: object | string,
  credentialType: CredentialType,
  orgId: string,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueOobEmailCredential}?credentialType=${credentialType}`
  const payload = data

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
