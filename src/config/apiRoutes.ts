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
        create: '/orgs',
        update: '/orgs',
        getAll: '/orgs',
        getById: '/orgs',
        getOrgDashboard: '/orgs/dashboard',
        invitations: '/invitations',
        orgRoles: '/orgs/roles',
        editUserROle: '/user-roles'
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
        getEcosystem: '/ecosystem'
    }
}
