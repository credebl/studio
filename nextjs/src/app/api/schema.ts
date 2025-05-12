import {
  CreateCredDeffFieldName,
  GetAllSchemaListParameter,
} from '@/features/dashboard/type/schema'
import { axiosGet, axiosPost } from '@/services/apiRequests'
import { AxiosResponse } from 'axios'
import apiRoutes from './apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const createSchemas = async (
  payload: Record<string, unknown>,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.create}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getSchemaById = async (
  schemaId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getSchemaById}/${schemaId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const createCredentialDefinition = async (
  payload: CreateCredDeffFieldName,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosPost(details)

    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getAllSchemas = async (
  { itemPerPage, page, allSearch }: GetAllSchemaListParameter,
  schemaType: string,
  ledgerId: string,
): Promise<AxiosResponse | string> => {
  const axiosPayload = {
    url: `${apiRoutes.Platform.getAllSchemaFromPlatform}?pageSize=${itemPerPage}&searchByText=${allSearch}&pageNumber=${page}&ledgerId=${ledgerId}&schemaType=${schemaType}`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosGet(axiosPayload)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getAllSchemasByOrgId = async (
  { search, itemPerPage, page }: GetAllSchemaListParameter,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getAll}?pageNumber=${page}&pageSize=${itemPerPage}&searchByText=${search}`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getAllCredDef = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}`
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

export const getCredDeffById = async (
  schemaId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getCredDefBySchemaId}/${schemaId}/cred-defs`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getCredDefDetailsByCredDefId = async (
  credDefId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}/${credDefId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
