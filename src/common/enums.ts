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
	abandoned = 'Declined'
}

export enum EndorsementType {
	schema = 'schema',
	credDef = 'credential-definition'
}

export enum EndorsementStatus {
    signed = "signed",
    rejected = "declined",
    requested = "requested",
    submitted = "submited"
}

export enum EcosystemRoles {
	member = "member",
	lead = "lead"
}
