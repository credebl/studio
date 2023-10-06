const EcosystemRoles = {
    member: "member",
    lead: "lead"
   }
   
   const isEnabledEcosystem = true
   const ecosystemRole = EcosystemRoles.member
   
   const checkEcosystem = () => ({
    isEnabledEcosystem,
    isEcosystemMember: ecosystemRole === EcosystemRoles.member && isEnabledEcosystem,
    isEcosystemLead: ecosystemRole === EcosystemRoles.lead && isEnabledEcosystem
   })
   
   export default checkEcosystem