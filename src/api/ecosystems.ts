import { axiosGet, axiosPost, axiosPut } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";
import { storageKeys } from "../config/CommonConstant";

export const createEcosystems = async (data: object) => {

    const url = apiRoutes.organizations.create
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
        return await axiosPost(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }
}





