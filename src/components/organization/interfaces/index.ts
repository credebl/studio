export interface UserOrgRole {
    id: number
    userId: number
    orgRoleId: number
    orgId: number
    orgRole: OrgRole
}

export interface Organisation {
    id: number
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    name: string
    description: string
    logoUrl: string
    website: string
    roles: string[]
    userOrgRoles: UserOrgRole[]
    org_agents: OrgAgent[]
    publicProfile: boolean
}

export interface OrgRole {
    id: number
    name: string
    description: string
    createDateTime?: string
    createdBy?: number
    lastChangedDateTime?: string
    lastChangedBy?: number
    deletedAt?: any
}

export interface OrgAgent {
    id: number
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    orgDid: string
    verkey: string
    agentEndPoint: string
    agentId: any
    isDidPublic: boolean
    agentSpinUpStatus: number
    agentOptions: any
    walletName: string
    tenantId: any
    agentsTypeId: number
    orgId: number
    orgAgentTypeId: number
    ledgers: ledgers
    org_agent_type: org_agent_type 
    agents_type: AgentsType
}

export interface AgentsType {
    id: number
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    agent: string
}

export interface org_agent_type{
id: number
createDateTime: string
createdBy: number
lastChangedDateTime: string
lastChangedBy: number
agent: string

}

export interface ledgers{
createDateTime: string
createdBy: number
id: number
isActive: boolean
lastChangedBy: number
lastChangedDateTime: string
name: string
networkString: string
networkType: string
poolConfig: string
registerDIDEndpoint: string
}
export interface OrgDashboard {
    usersCount: number
    schemasCount: number
    credentialsCount: number
    presentationsCount: number
}

export interface Connection {
    id: number
    orgId: number
    agentId: number
    connectionInvitation: string
    multiUse: boolean
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
  }
