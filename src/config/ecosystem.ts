import type { AxiosResponse } from "axios"
import { getFromLocalStorage, setToLocalStorage } from "../api/Auth"
import { getEcosystem } from "../api/ecosystem"
import { EcosystemRoles } from "../common/enums"
import { apiStatusCodes, storageKeys } from "./CommonConstant"

interface IProps {
    role?: EcosystemRoles
}

const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID)
const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

const role = localStorage.getItem("eco_role")

const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
const userDetails = userProfile && await JSON.parse(userProfile)

const isEnabledEcosystem = userDetails.enableEcosystem
const ecosystemRole = role ?? EcosystemRoles.ecosystemLead

const checkEcosystem = () => ({
    isEnabledEcosystem,
    isEcosystemMember: ecosystemRole === EcosystemRoles.ecosystemMember && isEnabledEcosystem,
    isEcosystemLead: ecosystemRole === EcosystemRoles.ecosystemLead && isEnabledEcosystem
})

const getEcosystemId = async (): Promise<string> => {
    if (!ecosystemId) {
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
    return ecosystemId
}

export { checkEcosystem, getEcosystemId }