import { getFromLocalStorage } from '../api/Auth';
import { storageKeys } from './CommonConstant';

export const getHeaderConfigs = async (tokenVal?: string) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN) || (typeof tokenVal === "string" ? tokenVal : "")

    return {
        headers: {
            'Content-Type': 'application/json',
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            Authorization: `Bearer ${token}`
        }
    }

}
export const getHeaderConfigsForFormData = async () => {
    const token = await getFromLocalStorage(storageKeys.TOKEN)

    return {
        headers: {
            "Content-Type": "multipart/form-data",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            Authorization: `Bearer ${token}`
        }
    }

}
