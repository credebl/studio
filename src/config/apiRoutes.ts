export const apiRoutes = {
    auth: {
        sendMail: '/auth/verification-mail',
        sinIn: '/auth/signin',
        verifyEmail: '/auth/verify',
        addDetails: '/auth/signup',
        passkeyUserDetails: '/users/password/',
        profile: '/profile',
    },
    users: {
        userProfile: '/users/profile',
        checkUser: '/users/',
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
        getSchemaById: '/schemas',
        createCredentialDefinition: '/cred-defs',
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
    Agent: {
        checkAgentHealth: '/agents/health',
        agentDedicatedSpinup: '/agents/spinup',
        agentSharedSpinup: '/agents/wallet'
    },
    Platform: {
        getAllSchemaFromPlatform: '/platform/schemas',
    },
    Public: {
        organizations: '/orgs/public-profile',
    },
    Ecosystem: {
        root: '/ecosystem',
        endorsements: {
            list: '/endorsement-transactions',
            createSchemaRequest: '/transaction/schema',
            createCredDefRequest: '/transaction/cred-def',
            signRequest: '/transaction/sign/',
            submitRequest: '/transaction/submit/',
            transactionApproval: '/transaction-approval/'
        },
        invitations: '/invitations',
        usersInvitation: '/users/invitations',
				members:'/members'

    }
}
