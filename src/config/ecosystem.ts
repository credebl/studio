import { getFromLocalStorage } from "../api/Auth"
import { EcosystemRoles } from "../common/enums"
import { storageKeys } from "./CommonConstant"

const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
const userDetails = userProfile && await JSON.parse(userProfile)

const isEnabledEcosystem = userDetails.enableEcosystem
const ecosystemRole = EcosystemRoles.ecosystemMember

const checkEcosystem = () => ({
    isEnabledEcosystem,
    isEcosystemMember: ecosystemRole === EcosystemRoles.member && isEnabledEcosystem,
    isEcosystemLead: ecosystemRole === EcosystemRoles.lead && isEnabledEcosystem
})

export default checkEcosystem