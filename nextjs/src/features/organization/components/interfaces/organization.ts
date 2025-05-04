/* eslint-disable @typescript-eslint/no-explicit-any */
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

  export interface OrgAgent {
    id: string;
    createDateTime: string;
    createdBy: string;
    lastChangedDateTime: string;
    lastChangedBy: string;
    orgDid: string;
    didDocument: string;
    verkey: string;
    agentEndPoint: string;
    agentId: any;
    isDidPublic: boolean;
    agentSpinUpStatus: number;
    agentOptions: any;
    walletName: string;
    tenantId: any;
    agentsTypeId: string;
    orgId: string;
    orgAgentTypeId: string;
    // ledgers: ledgers
    // org_agent_type: org_agent_type
    // agents_type: AgentsType
  }

  export interface Organisation {
    logoFile: string;
    id: string;
    createDateTime: string;
    createdBy: string;
    lastChangedDateTime: string;
    lastChangedBy: string;
    name: string;
    description: string;
    logoUrl: string;
    website: string;
    roles: string[];
    userOrgRoles: UserOrgRole[];
    org_agents: OrgAgent[];
    publicProfile: boolean;
    checked?: boolean | undefined;
    error?: string;
  }

  export interface UserOrgRole {
    id: string;
    userId: string;
    orgRoleId: string;
    orgId: string;
    orgRole: OrgRole;
  }

  export interface OrgRole {
    id: string;
    name: string;
    description: string;
    createDateTime?: string;
    createdBy?: string;
    lastChangedDateTime?: string;
    lastChangedBy?: string;
    deletedAt?: any;
  }

  export interface IDedicatedAgentConfig {
    walletName: string;
    agentEndpoint: string;
    apiKey: string;
  }