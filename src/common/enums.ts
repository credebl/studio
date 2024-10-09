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

export enum ProofRequestStateUserText {
	requestSent = 'Requested',
	requestReceived = 'Received',
	done = 'Verified',
	abandoned = 'Declined',
}

export enum SchemaType {
    INDY = 'indy',
    W3C = 'json'
}

export enum EcosystemRoles {
	ecosystemMember = "Ecosystem Member",
	ecosystemLead = "Ecosystem Lead",
}

export enum IssueCredentialUserText {
	offerSent = 'Offered',
	done = 'Accepted',
	abandoned = 'Declined',
	received = 'Pending',
	proposalReceived= 'Proposal Received',
	credIssued = 'Credential Issued'
}

export enum OrganizationRoles {
	organizationMember = "member",
	organizationOwner = "owner",
	organizationIssuer = "issuer",
	organizationVerifier = "verifier",
	organizationAdmin= 'admin'
}

export enum PlatformRoles {
	platformAdmin = "platform_admin"
}

export enum BulkIssuanceHistory {
 	started = 'PROCESS_STARTED',
 	completed = 'PROCESS_COMPLETED',
 	interrupted= 'PROCESS_INTERRUPTED',
 	retry= 'PROCESS_REINITIATED',
	partially_completed= 'PARTIALLY_COMPLETED'

}

export enum BulkIssuanceHistoryData {
	started = 'Process Started',
	completed = 'Process Completed',
	interrupted= 'Process Interrupted',
	retry= 'Process Reinitiated',
	partially_completed= "Partially Completed",
}

export enum BulkIssuanceStatus {
	successful= 'Successful',
	failed= 'Failed'
}

export enum DidMethod {
    INDY = 'did:indy',
    KEY = 'did:key',
    WEB = 'did:web',
    POLYGON = 'did:polygon'
}

export enum Network {
	TESTNET = 'testnet',
	MAINNET = 'mainnet'
}

export enum CommonConstants {
	BALANCELIMIT = 0.01
}

export enum Devices {
Linux = 'linux'
}

export enum Ledgers {
	INDY = 'indy',
	POLYGON = 'polygon',
	NO_LEDGER = 'noLedger'
}

export enum SchemaTypeValue {
	INDY = 'indy',
	POLYGON = 'polygon',
	NO_LEDGER = 'no_ledger'
}

export enum SchemaTypes {
    schema_INDY = 'indy',
    schema_W3C = 'w3c'
}

export enum CredentialType {
    INDY = 'indy',
    JSONLD = 'jsonld',
}

export enum ProtocolVersion {
	V1 = 'v1',
	V2 = 'v2'
}

export enum AutoAccept {
    ALWAYS = "always",
    CONTENT_APPROVED = "contentApproved",
    NEVER = "never"
}

export enum RequestType {
    INDY = 'indy',
    PRESENTATION_EXCHANGE = 'presentationExchange'
}

export enum ProofType {
	polygon = 'EcdsaSecp256k1Signature2019',
	no_ledger = 'Ed25519Signature2018'
}