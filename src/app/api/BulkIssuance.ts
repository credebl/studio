import { axiosGet, axiosPost } from '@/services/apiRequests'
import {
  getHeaderConfigs,
  getHeaderConfigsForFormData,
} from '@/config/GetHeaderConfigs'

import { AxiosResponse } from 'axios'
import { IConnectionListAPIParameter } from './connection'
import { SchemaTypes } from '@/common/enums'
import { apiRoutes } from '@/config/apiRoutes'

export const getSchemaCredDef = async (
  schemaType: SchemaTypes,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.credefList}?schemaType=${schemaType}`
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

export const DownloadCsvTemplate = async (
  templateId: string,
  schemaType: SchemaTypes,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.download}`

  const axiosPayload = {
    url,
    payload: {
      templateId,
      schemaType,
    },
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const uploadCsvFile = async (
  payload: { file: Uint8Array | Blob; fileName: string },
  templateId: string,
  schemaType: SchemaTypes,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.uploadCsv}?templateId=${templateId}&schemaType=${schemaType}`

  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigsForFormData(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getCsvFileData = async (
  requestId: string,
  pageNumber: number,
  pageSize: number,
  search: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}/${requestId}${apiRoutes.Issuance.bulk.preview}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

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

export const issueBulkCredential = async (
  requestId: string,
  clientId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}/${requestId}${apiRoutes.Issuance.bulk.bulk}`

  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
    payload: {
      clientId,
    },
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const retryBulkIssuance = async (
  fileId: string,
  clientId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}/${fileId}${apiRoutes.Issuance.bulk.retry}`

  const axiosPayload = {
    url,
    payload: { clientId },
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getFilesHistory = async ({
  page,
  itemPerPage,
  search,
  sortBy,
  sortingOrder,
  orgId,
}: IConnectionListAPIParameter & { orgId: string }): Promise<
  AxiosResponse | string
> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.files}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`

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

export const getFilesDataHistory = async (
  requestId: string,
  itemPerPage: number,
  page: number,
  search: string,
  sortingOrder: string,
  sortBy: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}/${requestId}${apiRoutes.Issuance.bulk.filesData}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortBy}&sortField=${sortingOrder}`

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
