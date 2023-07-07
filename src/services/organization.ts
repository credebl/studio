import { axiosPost } from "./apiRequests"

export const createOrganization = async (data: object) => {

    const url = `/organization`
    const payload = data

    const token = localStorage.getItem('access_token');

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
