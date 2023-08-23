import type { GetAllSchemaListParameter, createCredDeffFieldName, createSchema } from "../components/Resources/Schema/interfaces";
import { axiosDelete, axiosGet, axiosPost } from "../services/apiRequests";

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

export const getAllSchemas = async ({itemPerPage, page, allSearch }: GetAllSchemaListParameter) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.schema.getAllSchemaFromPlatform}?pageSize=${itemPerPage}&searchByText=${allSearch}&pageNumber=${page}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getAllSchemasByOrgId = async ({ search, itemPerPage, page }: GetAllSchemaListParameter, orgId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.schema.getAll}?orgId=${orgId}&pageNumber=${page}&pageSize=${itemPerPage}&searchByText=${search}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const addSchema = async (payload: createSchema) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: apiRoutes.schema.create,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getSchemaById = async (id: string, orgId: number) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.schema.getSchemaById}?schemaId=${id}&orgId=${orgId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    throw err?.message
  }
}

export const createCredentialDefinition = async (payload: createCredDeffFieldName) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: apiRoutes.schema.createCredentialDefinition,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPost(details)
		
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getCredDeffById = async (id: string, orgId: number) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.schema.getCredDeffBySchemaId}?schemaId=${id}&orgId=${orgId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}