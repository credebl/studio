import { verifyPresentation } from "../api/verification";

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
        invitations: '/users/invitations',
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
        getSchemaById:'/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDefBySchemaId: '/schemas',
        getAllSchemaFromPlatform: `/schemas/platform`
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
    Issuance: {
        getIssuedCredentials: '/credentials',
        getAllConnections: '/connections',
        issueCredential: '/credentials/offer',
    },
    Verification: {
        getAllRequestList: '/credentials/proofs',
        verifyCredential: '/proofs',
        presentationVerification: '/proofs',
        proofRequestAttributesVerification: '/proofs'
    },
        Agent:{
			checkAgentHealth: '/agent-service/health',
		},
		public:{
			organizations: '/organization/public-profiles',
			users:'/users/public-profiles',
		}

}
