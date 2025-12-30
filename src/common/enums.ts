// we are using enums from this file still EsLint is giving issues. For now disabling eslint rule for this file.

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

export enum Ledgers {
  INDY = 'indy',
  POLYGON = 'polygon',
  NO_LEDGER = 'noLedger',
}

export enum DataType {
  NUMBER = 'number',
  INTEGER = 'integer',
  STRING = 'string',
  DATE_TIME = 'datetime-local',
  ARRAY = 'array',
}

export enum Features {
  SEND_INVITATION = 'send_invitations',
  CREATE_ORG = 'create_org',
  CRETAE_SCHEMA = 'create_schema',
  ISSUANCE = 'issuance',
  VERIFICATION = 'verification',
  CREATE_CERTIFICATE = 'create_certificate',
}

export enum SchemaTypes {
  schema_INDY = 'indy',
  schema_W3C = 'w3c',
}

export enum SchemaType {
  INDY = 'indy',
  W3C = 'json',
}

export enum SchemaTypeValue {
  INDY = 'indy',
  POLYGON = 'polygon',
  NO_LEDGER = 'no_ledger',
}

export enum Roles {
  OWNER = 'owner',
  ADMIN = 'admin',
  ISSUER = 'issuer',
  VERIFIER = 'verifier',
  MEMBER = 'member',
}

export enum OrganizationRoles {
  organizationMember = 'member',
  organizationOwner = 'owner',
  organizationIssuer = 'issuer',
  organizationVerifier = 'verifier',
  organizationAdmin = 'admin',
}

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
export enum IssueCredentialUserText {
  offerSent = 'Offered',
  done = 'Accepted',
  abandoned = 'Declined',
  received = 'Pending',
  proposalReceived = 'Proposal Received',
  credIssued = 'Credential Issued',
}

export enum CredentialType {
  INDY = 'indy',
  JSONLD = 'jsonld',
}
export enum ProofType {
  polygon = 'EcdsaSecp256k1Signature2019',
  no_ledger = 'Ed25519Signature2018',
}
