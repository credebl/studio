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
    checked?: boolean | undefined
    error?: string;
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
    didDocument: string
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
export interface Values {
	website: any;
	name: string;
	description: string;
}
export interface ILogoImage {
	logoFile: string | File;
	imagePreviewUrl: string | ArrayBuffer | null | File;
	fileName: string;
}
export interface EditOrgdetailsModalProps {
	openModal: boolean;
	setMessage: (message: string) => void;
	setOpenModal: (flag: boolean) => void;
	onEditSucess?: () => void;
	orgData: Organisation | null;
}
export interface IOrgInfo {
	name: string;
	logoUrl: string;
    description: string;
    id: string;
    roles: string[]
}

export interface IUpdatePrimaryDid {
    id: string;
    did: string;
}

export interface IDidList {
    id: string;
    did: string;
    isPrimaryDid: boolean;
    createDateTime: string;
    lastChangedDateTime: string;
}

export interface IFormikValues {
	ledger: string;
	method: string;
    keyType:string;
	network: string;
    did: string;
	domain: string;
	privatekey: string;
	endorserDid: string;
}

export interface IDedicatedAgentConfig {
	walletName: string;
	agentEndpoint: string;
	apiKey: string;
}
interface IndySubDetails {
    [key: string]: string;
  }
export interface ILedgerDetails {
    bcovrin?: IndySubDetails;
    indicio?: IndySubDetails;
    mainnet?: string;
    testnet?: string;
    key?: string;
    web?: string;
  }
export interface ILedgerItem {
    id: string;
    name: string;
    details: ILedgerDetails;
    createDateTime: string;
    createdBy: string;
    lastChangedDateTime: string;
    lastChangedBy: string;
    deletedAt: string | null;
  }


  export interface IOrgCount {
    verificationRecordsCount: number;
    connectionRecordsCount: number;
    issuanceRecordsCount: number;
    orgInvitationsCount: number;
    orgUsersCount: number;
  }

  export interface IEcosystemOrganizations {
    id: string;
    orgId: string;
    status: string;
    createDateTime: string;
    lastChangedDateTime: string;
    ecosystemId: string;
    ecosystemRoleId: string;
    ecosystemRole: IEcosystemRole;
  }
  export interface IEcosystemRole {
    id: string;
    name: string;
    description: string;
    createDateTime: string;
    lastChangedDateTime: string;
    deletedAt: string | null;
  }