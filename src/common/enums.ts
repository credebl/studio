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

export enum IssueCredentialUserText {
	offerSent = 'Offered',
	done = 'Accepted',
	abandoned = 'Declined',
	received = 'Pending',
	proposalReceived= 'Proposal Received',
	credIssued = 'Credential Issued'
}

export enum EndorsementType {
	schema = 'schema',
	credDef = 'credential-definition'
}

export enum EndorsementStatus {
    signed = "signed",
    rejected = "declined",
    requested = "requested",
    submited = "submited"
}

export enum EcosystemRoles {
	ecosystemMember = "Ecosystem Member",
	ecosystemLead = "Ecosystem Lead"
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
