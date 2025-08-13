export enum IssueCredential {
  proposalSent = 'proposal-sent',
  proposalReceived = 'proposal-received',
  offerSent = 'offer-sent',
  offerReceived = 'offer-received',
  declined = 'decliend',
  requestSent = 'request-sent',
  requestReceived = 'request-received',
  credentialIssued = 'credential-issued',
  credentialReceived = 'credential-received',
  done = 'done',
  abandoned = 'abandoned',
}

export enum SchemaType {
  INDY = 'indy',
  W3C = 'json',
}

export enum EcosystemRoles {
  ecosystemMember = 'Ecosystem Member',
  ecosystemLead = 'Ecosystem Lead',
}

export enum OrganizationRoles {
  organizationMember = 'member',
  organizationOwner = 'owner',
  organizationIssuer = 'issuer',
  organizationVerifier = 'verifier',
  organizationAdmin = 'admin',
}

export enum PlatformRoles {
  platformAdmin = 'platform_admin',
}

export enum BulkIssuanceHistory {
  started = 'PROCESS_STARTED',
  completed = 'PROCESS_COMPLETED',
  interrupted = 'PROCESS_INTERRUPTED',
  retry = 'PROCESS_REINITIATED',
  partially_completed = 'PARTIALLY_COMPLETED',
}

export enum BulkIssuanceHistoryData {
  started = 'Process Started',
  completed = 'Process Completed',
  interrupted = 'Process Interrupted',
  retry = 'Process Reinitiated',
  partially_completed = 'Partially Completed',
}

export enum BulkIssuanceStatus {
  successful = 'Successful',
  failed = 'Failed',
}

export enum IssueCredentialUserText {
  offerSent = 'Offered',
  done = 'Accepted',
  abandoned = 'Declined',
  received = 'Pending',
  proposalReceived = 'Proposal Received',
  credIssued = 'Credential Issued',
}

export enum ProofRequestStateUserText {
  requestSent = 'Requested',
  requestReceived = 'Received',
  done = 'Verified',
  abandoned = 'Declined',
  presentationReceived = 'Presentation Received',
}

export enum DidMethod {
  INDY = 'did:indy',
  KEY = 'did:key',
  WEB = 'did:web',
  POLYGON = 'did:polygon',
}

export enum Network {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export enum PolygonNetworks {
  TESTNET = 'Polygon Testnet',
  MAINNET = 'Polygon Mainnet',
}

export enum CommonConstants {
  BALANCELIMIT = 0.01,
}

export enum Devices {
  Linux = 'linux',
}

export enum Ledgers {
  INDY = 'indy',
  POLYGON = 'polygon',
  NO_LEDGER = 'noLedger',
}

export enum SchemaTypeValue {
  INDY = 'indy',
  POLYGON = 'polygon',
  NO_LEDGER = 'no_ledger',
}

export enum SchemaTypes {
  schema_INDY = 'indy',
  schema_W3C = 'w3c',
}

export enum CredentialType {
  INDY = 'indy',
  JSONLD = 'jsonld',
}

export enum ProtocolVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export enum AutoAccept {
  ALWAYS = 'always',
  CONTENT_APPROVED = 'contentApproved',
  NEVER = 'never',
}

export enum RequestType {
  INDY = 'indy',
  PRESENTATION_EXCHANGE = 'presentationExchange',
}

export enum ProofType {
  polygon = 'EcdsaSecp256k1Signature2019',
  no_ledger = 'Ed25519Signature2018',
}

export enum Environment {
  PROD = 'PROD',
  DEV = 'DEV',
  QA = 'QA',
}

export enum APIVersion {
  version_v2 = '/v2',
}

export enum DataType {
  NUMBER = 'number',
  INTEGER = 'integer',
  STRING = 'string',
  DATE_TIME = 'datetime-local',
  ARRAY = 'array',
}

export enum ProofRequestState {
  presentationReceived = 'presentation-received',
  offerReceived = 'offer-received',
  declined = 'decliend',
  requestSent = 'request-sent',
  requestReceived = 'request-received',
  credentialIssued = 'credential-issued',
  credentialReceived = 'credential-received',
  done = 'done',
  abandoned = 'abandoned',
}

export enum AgentType {
  SHARED = 'shared',
  DEDICATED = 'dedicated',
}

// Define wallet spinup status enum
export enum WalletSpinupStatus {
  NOT_STARTED = 'not_started',
  AGENT_CONFIG_SET = 'agent_config_set',
  AGENT_SPINUP_INITIATED = 'agent_spinup_initiated',
  AGENT_SPINUP_COMPLETED = 'agent_spinup_completed',
  DID_PUBLISH_INITIATED = 'did_publish_initiated',
  DID_PUBLISH_COMPLETED = 'did_publish_completed',
  INVITATION_CREATION_STARTED = 'invitation_creation_started',
  INVITATION_CREATION_SUCCESS = 'invitation_creation_success',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WalletSpinupSteps {
  AGENT_SPINUP_INITIATED = 1,
  AGENT_SPINUP_COMPLETED = 2,
  DID_PUBLISH_INITIATED = 3,
  DID_PUBLISH_COMPLETED = 4,
  INVITATION_CREATION_STARTED = 5,
}
