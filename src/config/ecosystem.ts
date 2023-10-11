import type { AxiosResponse } from "axios"
import { getFromLocalStorage, setToLocalStorage } from "../api/Auth"
import { getEcosystem } from "../api/ecosystem"
import { EcosystemRoles } from "../common/enums"
import { apiStatusCodes, storageKeys } from "./CommonConstant"

export interface ICheckEcosystem {
    isEnabledEcosystem: boolean;
    isEcosystemMember: boolean;
    isEcosystemLead: boolean;
}

// const isEnabledEcosystem = userDetails.enableEcosystem
// const ecosystemRole = EcosystemRoles.ecosystemLead


const ecosystemId = async () => {
    const id = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID)
    return id
}

const getOrgId = async () => {
    const id = await getFromLocalStorage(storageKeys.ORG_ID)
    return id
}

const getUserProfile = async () => {
    const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
    const userDetails = userProfile && await JSON.parse(userProfile)
    return userDetails
}

const checkEcosystem = async (): Promise<ICheckEcosystem> => {
    const userData = await getUserProfile()

    // Added this key to change ecosystem role from localstorage until we'll get ecosystem role from backend
    const role = await localStorage.getItem("eco_role")
    
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
    const orgId = await getOrgId()
    if (!ecoId) {
        try {
            const { data } = await getEcosystem(orgId) as AxiosResponse

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS && data?.data && data?.data.length > 0) {
                const id = data?.data[0].id
                await setToLocalStorage(storageKeys.ECOSYSTEM_ID, id);
                return id
            }
        } catch (err) {
            console.log("ERROR-Get Ecosystem", err)
        }
    }
    return ecoId
}

export { checkEcosystem, getEcosystemId }