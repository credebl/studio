import { getFromLocalStorage } from '../api/Auth';
import { storageKeys } from './CommonConstant';

export const getHeaderConfigs = async (tokenVal?: string) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN) || (typeof tokenVal === "string" ? tokenVal : "")

    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }

}
export const getHeaderConfigsForFormData = async () => {
	const token = await getFromLocalStorage(storageKeys.TOKEN)

	return {
			headers: {
				"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`
			}
	}

}
