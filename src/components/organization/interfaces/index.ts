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

