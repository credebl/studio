import { axiosPost, axiosPut } from "../services/apiRequests"
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

interface DataPayload {
    name: string
    description: string
    logo: string
    tags: string
    orgId: number
    userId: number
}

export const createEcosystems = async (dataPayload: DataPayload) => {
    const url = apiRoutes.Ecosystem.root
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

export const updateEcosystem = async (data: object, orgId: string) => {

    const url = `${apiRoutes.organizations.update}/${orgId}`
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




