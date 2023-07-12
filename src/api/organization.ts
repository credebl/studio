import { axiosGet, axiosPost } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";

export const createOrganization = async (data: object) => {

    const url = apiRoutes.organizations.create
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

export const getOrganizations = async (pageNumber:number, pageSize: number, search='') => {

    const url = `${apiRoutes.organizations.getAll}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

    const token = localStorage.getItem('access_token');

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

