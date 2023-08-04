import { axiosGet, axiosPost, axiosPut } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";
import { storageKeys } from "../config/CommonConstant";

export const createOrganization = async (data: object) => {

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

export const updateOrganization = async (data: object) => {

    const url = apiRoutes.organizations.update
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


export const getOrganizations = async (pageNumber: number, pageSize: number, search = '') => {

    const url = `${apiRoutes.organizations.getAll}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

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

export const getOrganizationById = async (orgId: string) => {

    const url = `${apiRoutes.organizations.getById}/${orgId}`

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

export const getOrgDashboard = async (orgId: string) => {

    const url = `${apiRoutes.organizations.getOrgDashboard}?orgId=${Number(orgId)}`

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

export const spinupDedicatedAgent = async (data: object) => {

    const url = apiRoutes.organizations.agentDedicatedSpinup
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

export const spinupSharedAgent = async (data: object) => {

    const url = apiRoutes.organizations.agentSharedSpinup
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


export const getOrganizationRoles = async () => {


    const url = `${apiRoutes.organizations.orgRoles}`

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

//Get users of the organization
export const getOrganizationUsers = async () => {

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

    const url = `${apiRoutes.users.fetchUsers}?orgId=${orgId}`

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

// Edit user roles
export const editOrganizationUserRole = async (userId: number, roles: number[]) => {

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

    const url = apiRoutes.organizations.editUserROle
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

//Create Connection


export const createConnection = async (orgName: string) => {

    const url = apiRoutes.connection.create

    const orgId = await getFromLocalStorage(storageKeys.ORG_ID)
    
    const data = {
        label: orgName,
        multiUseInvitation: true,
        autoAcceptConnection: true,
        orgId: Number(orgId)
    }
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


