export const apiRoutes = {
	auth: {
		sendMail: '/auth/verification-mail',
		sinIn: '/auth/signin',
		verifyEmail: '/auth/verify',
		addDetails: '/auth/signup',
		passkeyUserDetails: '/users/password/',
		profile: '/profile',
		generateRegistration: 'auth/passkey/generate-registration',
		verifyRegistration: 'auth/passkey/verify-registration/',
		getDeviceList: 'auth/passkey/',
		updateDeviceName: 'auth/passkey',
		userUpdate: 'auth/passkey/user-details',
		fidoDevice: 'auth/passkey',
		fidoAuthentication: 'auth/passkey/authentication-options',
		fidoVerifyAuthentication: 'auth/passkey/verify-authentication/',
		keyClockResetPassword: 'auth/reset-password',
		forgotPassword: 'auth/forgot-password',
		resetPassword: 'auth/password-reset',
		refreshToken: '/auth/refresh-token'
	},
	users: {
		userProfile: '/users/profile',
		checkUser: '/users/',
		invitations: '/users/org-invitations',
		fetchUsers: '/users',
		update: '/users',
		recentActivity: '/users/activity',
		platformSettings: '/users/platform-settings',
		userCredentials:'/users/user-credentials'
	},
	organizations: {
		root: '/orgs',
		create: '/orgs',
		update: '/orgs',
		getAll: '/orgs',
		getById: '/orgs',
		getOrgDashboard: '/orgs/dashboard',
		invitations: '/invitations',
		orgRoles: '/orgs/roles',
		editUserROle: '/user-roles',
		didList: '/dids',
		createDid: '/agents/did',
		primaryDid: '/primary-did'
	},
	connection: {
		create: '/connections',
	},
	schema: {
		create: '/schemas',
		getAll: '/schemas',
		getSchemaById: '/schemas',
		createCredentialDefinition: '/cred-defs',
		getCredDefBySchemaId: '/schemas',
	},
	Issuance: {
		getIssuedCredentials: '/credentials',
		getAllConnections: '/connections',
		issueCredential: '/credentials/offer',
		issueOobEmailCredential: '/credentials/oob/email',
		bulk:{
			credefList:'/credentials/bulk/template',
			uploadCsv: '/bulk/upload',
			preview: '/preview',
			bulk: '/bulk',
			files: '/bulk/files',
			filesData: '/bulk/file-data',
			retry: '/retry/bulk'
		},
		download:'/credentials/bulk/template'
	},
	Verification: {
		getAllRequestList: '/credentials/proofs',
		verifyCredential: '/proofs',
		presentationVerification: '/proofs',
		proofRequestAttributesVerification: '/verified-proofs',
		verificationCredDef: '/verifiation/cred-defs'
	},
	Agent: {
		checkAgentHealth: '/agents/health',
		agentDedicatedSpinup: '/agents/spinup',
		agentSharedSpinup: '/agents/wallet',
		getLedgerConfig: '/agents/ledgerConfig',
		createPolygonKeys: '/agents/polygon/create-keys',
		setAgentConfig:'/agents/configure'
	},
	Platform: {
		getAllSchemaFromPlatform: '/platform/schemas',
		getLedgers: '/platform/ledgers',
		getLedgerPlatformUrl: '/platform/network/url/'
	},
	Public: {
		organizations: '/orgs/public-profile',
		organizationDetails: '/orgs/public-profiles',
	},
	Ecosystem: {
		root: '/ecosystem',
		endorsements: {
			list: '/endorsement-transactions',
			createSchemaRequest: '/transaction/schema',
			createCredDefRequest: '/transaction/cred-def',
			signRequest: '/transaction/sign/',
			submitRequest: '/transaction/submit/',
			rejectRequest: '/transactions/',
			transactionApproval: '/transaction-approval/',
		},
		invitations: '/invitations',
		usersInvitation: '/users/invitations',
		members: '/members',
	},
	setting:{
		setting: '/client_credentials'
	}
};
