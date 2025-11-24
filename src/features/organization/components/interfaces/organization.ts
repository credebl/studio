/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserOrgRole {
  id: string
  userId: string
  orgRoleId: string
  orgId: string
  orgRole: OrgRole
}
export interface IOrganisation {
  logoFile: string
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  name: string
  description: string
  countryId: number
  stateId: number
  cityId: number
  logoUrl: string
  website: string
  roles: string[]
  userOrgRoles: UserOrgRole[]
  org_agents: IOrgAgent[]
  publicProfile: boolean
  checked?: boolean
  error?: string
  didDetails: IDidCreationDetails
}

export interface IOrgDashboard {
  usersCount: number
  schemasCount: number
  credentialsCount: number
  presentationsCount: number
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
export interface IOrgAgent {
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
  ledgers: ILedgers
  org_agent_type: IOrgAgentType
  agents_type: IAgentsType
}
interface IDidCreationDetails {
  lastChangedDateTime: string
  createDateTime: string
}
export interface IAgentsType {
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  agent: string
}
export interface IOrgAgentType {
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  agent: string
}
export interface ILedgers {
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
export interface IOrgDashboard {
  usersCount: number
  schemasCount: number
  credentialsCount: number
  presentationsCount: number
}
export interface IConnection {
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
export interface IOrgInterface {
  name: string
  website: string
  logoUrl: string
  description: string
}
export interface IOrgDataInterface {
  orgData: IOrgInterface
}
export interface IOrgWalletDetailsObject {
  orgDid: string
  ledgers: {
    name: string
    networkType: string
  }
  networkType: string
  walletName: string
  createDateTime: string
}
export interface IUserDetails {
  profileImg: string
  lastName: string
  firstName: string
  email: string
  publicProfile: boolean
  id: string
  username: string
}
export interface IWalletDetails {
  agent_invitations: {
    connectionInvitation: string
  }[]
  orgDid: string
  ledgers: {
    name: string
    networkType: string
  }
}
export interface IOrgDetails {
  org_agents: IWalletDetails[]
  logoUrl: string
  name: string
  website: string
  description: string
}
export interface IExploreOrg {
  orgData: IOrgDetails
}
export interface Values {
  website: any
  name: string
  description: string
}
export interface ILogoImages {
  logoFile: string | File
  imagePreviewUrl: string | ArrayBuffer | null | File
  fileName: string
}
export interface IEditOrgdetailsModalProps {
  orgData: IOrganisation | null
}
export interface IOrgInformation {
  name: string
  logoUrl: string
  description: string
  id: string
  roles: string[]
}

export interface IUpdatePrimaryDid {
  id: string
  did: string
}

export interface IDidListData {
  id: string
  did: string
  isPrimaryDid: boolean
  createDateTime: string
  lastChangedDateTime: string
}

export interface IFormikValue {
  ledger: string
  method: string
  keyType: string
  network: string
  did: string
  domain: string
  privatekey: string
  endorserDid: string
}

export interface IDedicatedAgentConfiguration {
  walletName: string
  agentEndpoint: string
  apiKey: string
}
interface IndySubDetails {
  [key: string]: string
}
export interface ILedgerDetail {
  bcovrin?: IndySubDetails
  indicio?: IndySubDetails
  mainnet?: string
  testnet?: string
  key?: string
  web?: string
}
export interface ILedgerItem {
  id: string
  name: string
  details: ILedgerDetail
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  deletedAt: string | null
}

export interface IOrgCountData {
  verificationRecordsCount: number
  connectionRecordsCount: number
  issuanceRecordsCount: number
  orgInvitationsCount: number
  orgUsersCount: number
}

export interface IEcosystemOrganization {
  id: string
  orgId: string
  status: string
  createDateTime: string
  lastChangedDateTime: string
  ecosystemId: string
  ecosystemRoleId: string
  ecosystemRole: IEcosystemRoles
}
export interface IEcosystemRoles {
  id: string
  name: string
  description: string
  createDateTime: string
  lastChangedDateTime: string
  deletedAt: string | null
}

export interface IOrgFormValues {
  name: string
  description: string
  countryId: string | null
  stateId: string | null
  cityId: string | null
  website: string
  logoFile: File | null
  logoPreview?: string
  logoUrl: string | null
}

export interface ISharedAgentForm {
  seeds: string
  orgId: string
  maskedSeeds: string
  isCopied: boolean
  orgName: string
  loading: boolean
  ledgerConfig: boolean
  setLedgerConfig: (value: boolean) => void
  submitSharedWallet: (values: IValuesShared, domain: string) => void
}

export interface ILedgerConfigProps {
  orgName: string
  orgId: string
  maskedSeeds: string
  seeds: string
  submitSharedWallet: (values: IValuesShared, domainValue: string) => void
  walletName: string
}

export interface IValuesShared {
  label?: string
}

interface IDetails {
  [key: string]: string | { [subKey: string]: string }
}

export interface ILedgerItems {
  name: string
  details: IDetails
}

export interface ILedgerConfigData {
  indy: {
    'did:indy': {
      [key: string]: string
    }
  }
  polygon: {
    'did:polygon': {
      [key: string]: string
    }
  }
  noLedger: {
    [key: string]: string
  }
}

export interface IDedicatedAgentForm {
  ledgerConfig: boolean
  orgId: string
  maskedSeeds: string
  setLedgerConfig: (value: boolean) => void
  seeds: string
  setAgentConfig: any
  submitDedicatedWallet: (
    values: IValuesShared,
    privatekey: string,
    domain: string,
  ) => void
  onConfigureDedicated: () => void
}
