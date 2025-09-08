export interface Organization {
  id: string
  name: string
  description: string
  logoUrl: string
  userOrgRoles: {
    orgRole: {
      name: string
    }
  }[]
  org_agents?: {
    id: string
    name: string
    email: string
  }[]
}

export interface GetOrganizationsResponse {
  data: {
    organizations: Organization[]
  }
}

export interface OrgRole {
  id: string
  name: string
  description: string
  createDateTime?: string
  createdBy?: string
  lastChangedDateTime?: string
  lastChangedBy?: string
  deletedAt?: Date | null
}

export interface UserOrgRole {
  id: string
  userId: string
  orgRoleId: string
  orgId: string
  orgRole: OrgRole
}

export interface OrgAgentType {
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  agent: string
}

export interface Ledgers {
  createDateTime: string
  createdBy: string
  id: string
  isActive: boolean
  lastChangedBy: string
  lastChangedDateTime: string
  name: string
  networkString: string
  networkType: string
  poolConfig: string
  registerDIDEndpoint: string
}

export interface AgentsType {
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  agent: string
}
export interface OrgAgent {
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  orgDid: string
  didDocument: string
  verkey: string
  agentEndPoint: string
  agentId: string | null
  isDidPublic: boolean
  agentSpinUpStatus: number
  agentOptions: Record<string, unknown>
  walletName: string
  tenantId: string | null
  agentsTypeId: string
  orgId: string
  orgAgentTypeId: string
  ledgers: Ledgers
  org_agent_type: OrgAgentType
  agents_type: AgentsType
}

export interface Organisation {
  logoFile: string
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  name: string
  description: string
  logoUrl: string
  website: string
  roles: string[]
  userOrgRoles: UserOrgRole[]
  org_agents: OrgAgent[]
  publicProfile: boolean
  checked?: boolean
  error?: string
}
