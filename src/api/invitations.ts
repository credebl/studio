import { axiosGet, axiosPost } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

export const getOrganizationInvitations = async (pageNumber: number, pageSize: number, search = '') => {

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

    const url = `${apiRoutes.organizations.invitations}/${orgId}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

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

export const createInvitations = async (invitationList: Array<object>) => {

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

    const url = apiRoutes.organizations.invitations
    const payload = {
        invitations: invitationList,
        orgId: Number(orgId)
    }
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

// Received Invitations by User
export const getUserInvitations = async (pageNumber: number, pageSize: number, search = '') => {

    const url = `${apiRoutes.users.invitations}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

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

// Accept/ Reject Invitations
export const acceptRejectInvitations = async (invitationId: number, status: string) => {

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

    const url = apiRoutes.users.invitations
    
    const payload = {
        invitationId,
        orgId: Number(orgId),
        status
    }
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


