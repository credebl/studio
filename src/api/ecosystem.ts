import { axiosGet, axiosPost, axiosPut } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";

interface DataPayload {
    name: string
    description: string
    logo: string
    tags: string
    userId: number
}


export const createEcosystems = async (dataPayload: DataPayload) => {
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

export const updateEcosystem = async (data: object) => {
    const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
    const url = `${apiRoutes.Ecosystem.root}/${orgId}`
    const payload = data
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

export const getEcosystem = async () => {
    const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
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

export const getEndorsementList = async () => {

    const url = `${apiRoutes.Ecosystem.endorsements.list}`

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

export const createSchemaRequest = async (data: object, orgId: number) => {

    const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.endorsements.createSchemaRequest}`
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

export const createCredDefRequest = async (data: object, orgId: number) => {

    const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.endorsements.createCredDefRequest}`
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

export const editOrganizationUserRole = async (userId: number, roles: number[]) => {

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

    const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.editUserROle}/${userId}`
    const payload = {
        orgId,
        userId,
        orgRoleId: roles
    }

    const axiosPayload = {
        url,
        payload,
        config: await getHeaderConfigs()
    }

    try {
        return axiosPut(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}