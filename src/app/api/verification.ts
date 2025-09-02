import { APIVersion, RequestType } from '@/features/common/enum'
import { axiosGet, axiosPost } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { IConnectionListAPIParameter } from './connection'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const getVerifiedProofDetails = async (
  proofId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.proofRequestAttributesVerification}/${proofId}`
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

export const getVerificationList = async (
  orgId: string,
  apiParameter: IConnectionListAPIParameter,
): Promise<AxiosResponse | string> => {
  const { page, itemPerPage, search, sortBy, sortingOrder } = apiParameter

  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?pageSize=${itemPerPage}&pageNumber=${page}&search=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`

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

export const verifyPresentation = async (
  proofId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.presentationVerification}/${proofId}/verify`
  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const createOobProofRequest = async (
  payload: object,
  requestType: RequestType,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.oobProofRequest}?requestType=${requestType}`
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

export const verifyCredential = async (
  payload: object,
  requestType: RequestType,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?requestType=${requestType}`
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

export const verifyCredentialV2 = async (
  payload: object,
  requestType: RequestType,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${APIVersion.version_v2}${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?requestType=${requestType}`
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

export const getCredentialDefinitionsForVerification = async (
  schemaId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Verification.verificationCredDef}/${schemaId}`

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
