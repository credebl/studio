import { EcosystemRoles } from "../common/enums"

const isEnabledEcosystem = true
const ecosystemRole = EcosystemRoles.ecosystemLead

const checkEcosystem = () => ({
    isEnabledEcosystem,
    isEcosystemMember: ecosystemRole === EcosystemRoles.ecosystemMember && isEnabledEcosystem,
    isEcosystemLead: ecosystemRole === EcosystemRoles.ecosystemLead && isEnabledEcosystem
})

export default checkEcosystem