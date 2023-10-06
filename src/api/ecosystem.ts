import { axiosGet, axiosPost, axiosPut } from "../services/apiRequests"
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

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

    const token = await getFromLocalStorage(storageKeys.TOKEN)
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }
    const axiosPayload = {
        url,
        payload,
        config
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
    const token = await getFromLocalStorage(storageKeys.TOKEN)
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }
    const axiosPayload = {
        url,
        payload,
        config
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