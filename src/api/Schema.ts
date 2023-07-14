import type { createCredDeffFieldName, createSchema, GetAllSchemaListParameter } from "../components/Resources/Schema/interfaces";
import { apiRoutes } from "../config/apiRoutes";
import { storageKeys } from "../config/CommonConstant";
import { axiosGet, axiosPost } from "../services/apiRequests";
import { getFromLocalStorage } from "./Auth";

export const getAllSchemas = async({ search, itemPerPage, sortBy, page }:GetAllSchemaListParameter, orgId:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
    const details = {
        url: `${apiRoutes.schema.getAll}?orgId=${orgId}&searchByText=${search}&pagepage=${page}&items_per_page=${itemPerPage}&schemaSortBy=${sortBy}&items_per_page=${itemPerPage}&schemaSortBy=${sortBy}`,
        config: {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      };
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    }
}

export const addSchema = async(payload:createSchema) => {
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
      
    try{
        const response = await axiosPost(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

export const getSchemaById = async(id:string, orgId:number) => {
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
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

export const createCredentialDefinition = async(payload:createCredDeffFieldName) => {
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
      
    try{
        const response = await axiosPost(details)
        return response
    }
    catch(error){
        const err = error as Error
        return err?.message
    } 
}

export const getCredDeffById = async(id:string, orgId:number) => {
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
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

