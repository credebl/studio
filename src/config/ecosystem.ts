import { getFromLocalStorage } from "../api/Auth"
import { EcosystemRoles } from "../common/enums"
import { storageKeys } from "./CommonConstant"

const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
const userDetails = userProfile && await JSON.parse(userProfile)

const isEnabledEcosystem = userDetails.enableEcosystem
const ecosystemRole = EcosystemRoles.ecosystemMember

const checkEcosystem = () => ({
    isEnabledEcosystem,
    isEcosystemMember: ecosystemRole === EcosystemRoles.ecosystemMember && isEnabledEcosystem,
    isEcosystemLead: ecosystemRole === EcosystemRoles.ecosystemLead && isEnabledEcosystem
})

export default checkEcosystem