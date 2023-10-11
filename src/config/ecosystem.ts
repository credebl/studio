import type { AxiosResponse } from "axios"
import { getFromLocalStorage, setToLocalStorage } from "../api/Auth"
import { getEcosystem } from "../api/ecosystem"
import { EcosystemRoles } from "../common/enums"
import { apiStatusCodes, storageKeys } from "./CommonConstant"
import { getOrganizationById } from "../api/organization"

export interface ICheckEcosystem {
    isEnabledEcosystem: boolean;
    isEcosystemMember: boolean;
    isEcosystemLead: boolean;
}

export interface IOrgDetails {
    orgName: string
    orgDid: string
}

const ecosystemId = async () => {
    const id = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID)
    return id
}

const getOrgId = async () => {
    const id = await getFromLocalStorage(storageKeys.ORG_ID)
    return id
}

const getOrgData = async () => {
    const data = await getFromLocalStorage(storageKeys.ORG_DETAILS)
    return data
}

const getEcosystemRole = async () => {
    const data = await getFromLocalStorage(storageKeys.ECOSYSTEM_ROLE)
    return data
}

const getUserProfile = async () => {
    const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
    const userDetails = userProfile && await JSON.parse(userProfile)
    return userDetails
}

const checkEcosystem = async (): Promise<ICheckEcosystem> => {
    await getEcosystemId()
    const userData = await getUserProfile()
    const role = await getEcosystemRole()

    const isEnabledEcosystem = userData?.enableEcosystem
    const ecosystemRole = role ?? EcosystemRoles.ecosystemLead
    return {
        isEnabledEcosystem,
        isEcosystemMember: ecosystemRole === EcosystemRoles.ecosystemMember && isEnabledEcosystem,
        isEcosystemLead: ecosystemRole === EcosystemRoles.ecosystemLead && isEnabledEcosystem
    }
}

const getEcosystemId = async (): Promise<string> => {
    const ecoId = await ecosystemId()
    const ecoRole = await getEcosystemRole()
    const orgId = await getOrgId()
    if (!ecoId || !ecoRole) {
        try {
            const { data } = await getEcosystem(orgId) as AxiosResponse

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS && data?.data && data?.data.length > 0) {
                const response = data?.data[0]
                const id = response?.id
                const role = response?.ecosystemOrgs[0].ecosystemRole.name
                await setToLocalStorage(storageKeys.ECOSYSTEM_ID, id);
                await setToLocalStorage(storageKeys.ECOSYSTEM_ROLE, role);
                return id
            }
        } catch (err) {
            console.log("ERROR-Get Ecosystem", err)
        }
    }
    return ecoId
}

const getOrgDetails = async (): Promise<IOrgDetails> => {
    const orgId = await getOrgId()
    const org = await getOrgData()
    const orgData: IOrgDetails = org && JSON.parse(org)
    const isOrgData = Object.keys(orgData).length > 0
    if (!isOrgData) {
        try {
            const { data } = await getOrganizationById(orgId) as AxiosResponse

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const orgData: IOrgDetails = {
                    orgName: data?.data?.name,
                    orgDid: data?.data && data?.data?.org_agents?.length > 0 ? data?.data?.org_agents[0]?.orgDid : ""
                }
                await setToLocalStorage(storageKeys.ORG_DETAILS, JSON.stringify(orgData));
                return orgData
            }
        } catch (err) {
            console.log("ERROR-Get ORG Details", err)
        }
    }
    return orgData
}

export { checkEcosystem, getEcosystemId, getOrgDetails }