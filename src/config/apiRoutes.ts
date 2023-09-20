export const apiRoutes = {
    auth:{
        sendMail: '/users/send-mail',
        sinIn: '/users/login',
        verifyEmail:'/users/verify',
        userProfile: 'users/profile',
        checkUser:'/users/check-user/',
        addDetails:'/users/add/',
        passkeyUserDetails:'/users/password/',
        profile:'/profile'
    },
    users:{
        userProfile: '/users/profile',
        checkUser:'/users/',
        invitations: '/users/org-invitations',
        fetchUsers: '/users',
        update: '/users',
        recentActivity: '/users/activity',
    },
    organizations: {
        root: '/orgs',
        create: '/organization',
        update: '/organization',
        getAll: '/organization',
        getById: '/organization',
        getOrgDashboard: '/organization/dashboard',
        agentDedicatedSpinup: '/agent-service/spinup',
        agentSharedSpinup: '/agent-service/tenant',
        invitations: '/organization/invitations',
        orgRoles: '/organization/roles',
        editUserROle: '/organization/user-roles'
    },
    connection: {
        create: '/connections',
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById:'/schemas',
        createCredentialDefinition: '/cred-defs',
        getCredDefBySchemaId: '/schemas',
    },
    fido: {
        generateRegistration: 'fido/generate-registration-options',
        verifyRegistration: 'fido/verify-registration/',
        getDeviceList: 'fido/user-details/',
        updateDeviceName: 'fido/device-name',
        userUpdate: 'fido/user-update',
        fidoDevice: 'fido/device',
        fidoAuthentication: 'Fido/generate-authentication-options',
        fidoVerifyAuthentication: 'Fido/verify-authentication/'

    },
		Issuance:{
			getIssuedCredentials:'/issue-credentials',
			getAllConnections:'/connections',
			issueCredential:'/issue-credentials/create-offer'
		},
        Verification:{
			getAllRequestList: '/proofs',
			verifyCredential:'/proofs/request-proof',
            presentationVerification:'/proofs/verify-presentation',
		    proofRequestAttributesVerification:'/proofs/form-data'
		},
        Agent:{
			checkAgentHealth: '/agents/health',       
            agentDedicatedSpinup: '/agents/spinup',
            agentSharedSpinup: '/agents/wallet'
		},	
		Platform: {
			getAllSchemaFromPlatform: '/platform/schemas',
	},
		public:{
			organizations: '/organization/public-profiles',
			users:'/users/public-profiles',
		}
}
