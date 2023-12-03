export interface UserOrgRole {
    id: string
    userId: string
    orgRoleId: string
    orgId: string
    orgRole: OrgRole
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
    
}

export interface OrgRole {
    id: string
    name: string
    description: string
    createDateTime?: string
    createdBy?: string
    lastChangedDateTime?: string
    lastChangedBy?: string
    deletedAt?: any
}

export interface OrgAgent {
    id: string
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    lastChangedBy: string
    orgDid: string
    verkey: string
    agentEndPoint: string
    agentId: any
    isDidPublic: boolean
    agentSpinUpStatus: number
    agentOptions: any
    walletName: string
    tenantId: any
    agentsTypeId: string
    orgId: string
    orgAgentTypeId: string
    ledgers: ledgers
    org_agent_type: org_agent_type 
    agents_type: AgentsType
}

export interface AgentsType {
    id: string
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    lastChangedBy: string
    agent: string
}

export interface org_agent_type{
id: string
createDateTime: string
createdBy: string
lastChangedDateTime: string
lastChangedBy: string
agent: string

}

export interface ledgers{
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
export interface OrgDashboard {
    usersCount: number
    schemasCount: number
    credentialsCount: number
    presentationsCount: number
}

export interface Connection {
    id: string
    orgId: string
    agentId: string
    connectionInvitation: string
    multiUse: boolean
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    lastChangedBy: string
  }

  export interface EcosystemDashboard {
    membersCount: number
    endorsementsCount: number
  }

export interface OrgInterface {
    name: string;
    website: string;
    logoUrl: string;
    description: string;
}

export interface OrgDataInterface {
    orgData: OrgInterface
}

export interface OrgWalletDetailsObject {
	orgDid:string
	ledgers:{
		name:string
	  networkType:string
	}
	networkType:string
	walletName:string
	createDateTime:string
}

export interface UserDetails {
    profileImg: string;
    lastName: string;
    firstName: string;
    email: string;
    publicProfile: boolean;
    id: string;
    username: string;
}

export interface IWalletData {
    agent_invitations: {
        connectionInvitation: string
    }[]
    orgDid: string
    ledgers: {
        name: string
        networkType: string
    }
}

export interface IOrgData {
    org_agents: IWalletData[]
    logoUrl: string
    name: string
    website: string
    description: string
}
export interface IExploreOrg {
    orgData: IOrgData
}

