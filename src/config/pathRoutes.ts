export const pathRoutes = {
	auth: {
		signUp: '/authentication/sign-up',
		sinIn: '/authentication/sign-in',
		verifyEmail: '/auth/verify',
	},
	users: {
		dashboard: '/dashboard',
		profile: '/profile',
		invitations: '/invitations',
		fetchUsers: '/users',
		connectionList: '/connections',
		platformSetting: '/platform-settings',
	},
	organizations: {
		root: '/organizations',
		invitations: '/organizations/invitations',
		users: '/organizations/users',
		schemas: `/organizations/schemas`,
		dashboard: '/organizations/dashboard',
		issuedCredentials: '/organizations/credentials',
		credentials: '/organizations/verification',
		createSchema: '/organizations/schemas/create',
		viewSchema: '/organizations/schemas/view-schema',
		Issuance: {
			issue: '/organizations/credentials/issue',
			schema: '/organizations/credentials/issue/schemas',
			credDef: '/organizations/credentials/issue/schemas/cred-defs',
			connections:
				'/organizations/credentials/issue/schemas/cred-defs/connections',
			issuance:
				'/organizations/credentials/issue/schemas/cred-defs/connections/issuance',
			history: '/organizations/credentials/issue/bulk-issuance/history',
			details: '/organizations/credentials/issue/bulk-issuance/history/details',
			bulkIssuance: '/organizations/credentials/issue/bulk-issuance',
			email: '/organizations/credentials/issue/email',
			emailHistory: '/organizations/credentials/issue/email/history',
		},
		verification: {
			schema: '/organizations/verification/schemas',
			credDef: '/organizations/verification/schemas/cred-defs',
			connections: '/organizations/verification/schemas/cred-defs/connections',
			verify:
				'/organizations/verification/schemas/cred-defs/connections/verification',
		},
	},
	ecosystem: {
		root: '/ecosystems',
		dashboard: '/ecosystems/dashboard',
		endorsements: '/ecosystems/endorsement',
		invitation: '/ecosystems/invitation',
		sentinvitation: '/ecosystems/invitations',
	},
	documentation: {
		root: 'https://docs.credebl.id',
	},
	schema: {
		create: '/schemas',
		getAll: '/schemas',
		getSchemaById: '/schemas/id',
		createCredentialDefinition: '/credential-definitions',
		getCredDeffBySchemaId: '/schemas/credential-definitions',
	},
	back: {
		schema: {
			schemas: '/organizations/schemas',
		},
		verification: {
			credDef: '/organizations/verification/schemas/cred-defs',
			schemas: '/organizations/verification/schemas',
			verification: '/organizations/verification/schemas/cred-defs/connections',
		},
		issuance: {
			credDef: '/organizations/credentials/issue/schemas/cred-defs',
			schemas: '/organizations/credentials/issue/schemas',
			connections:
				'/organizations/credentials/issue/schemas/cred-defs/connections',
		},
	},
};
