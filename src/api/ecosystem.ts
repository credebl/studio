
import { axiosGet, axiosPost, axiosPut } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";

interface CreateEcosystemPayload {
    name: string
    description: string
    logo: string
    tags?: string
    userId: number
}

export interface GetEndorsementListParameter {
    itemPerPage: number,
    page: number,
    search: string,
    sortBy: string,
    type: string,
    status: string
}


export const createEcosystems = async (dataPayload: CreateEcosystemPayload) => {
    const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

    const url = `${apiRoutes.Ecosystem.root}/${orgId}`
    const payload = dataPayload
    const axiosPayload = {
        url,
        payload,
        config: await getHeaderConfigs()
    }

    try {
        return await axiosPost(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}

export const updateEcosystem = async (dataPayload: CreateEcosystemPayload) => {
    const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
    const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);

    const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}`
    const payload = dataPayload

    const axiosPayload = {
        url,
        payload,
        config: await getHeaderConfigs()
    }

    try {
        return await axiosPut(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}


export const getEcosystem = async (orgId: string) => {
    const url = `${apiRoutes.Ecosystem.root}/${orgId}`

    const axiosPayload = {
        url,
        config: await getHeaderConfigs()
    }

    try {
        return await axiosGet(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}

export const getEndorsementList = async ({ search, itemPerPage, page, type, status }: GetEndorsementListParameter, ecosystemId: string, orgId: string) => {

    const url = `${apiRoutes.Ecosystem.root}/${orgId}/${ecosystemId}${apiRoutes.Ecosystem.endorsements.list}?${page ? `pageNumber=${page}` : ""}${search ? `&search=${search}` : ""}${itemPerPage ? `&pageSize=${itemPerPage}` : ""}${type ? `&type=${type}` : ""}${status ? `&status=${status}` : ""}`

    const axiosPayload = {
        url,
        config: await getHeaderConfigs()
    }

    try {
        return await axiosGet(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}

export const createSchemaRequest = async (data: object, endorsementId: string, orgId: number) => {
    const url = `${apiRoutes.Ecosystem.root}/${endorsementId}/${orgId}${apiRoutes.Ecosystem.endorsements.createSchemaRequest}`
    const payload = data
    const axiosPayload = {
        url,
        payload,
        config: await getHeaderConfigs()
    }

    try {
        return await axiosPost(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}

export const createCredDefRequest = async (data: object, ecosystemId: string, orgId: number) => {

    const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}${apiRoutes.Ecosystem.endorsements.createCredDefRequest}`
    const payload = data
    const axiosPayload = {
        url,
        payload,
        config: await getHeaderConfigs()
    }

    try {
        return await axiosPost(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}

export const getEcosystemDashboard = async (ecosystemId: string, orgId: string) => {
    
    const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}/dashboard`

    const token = await getFromLocalStorage(storageKeys.TOKEN)

    const config = { 
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }
    const axiosPayload = {
        url,
        config
    }

    try {
        return await axiosGet(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }

}
