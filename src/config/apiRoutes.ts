export const apiRoutes = {
    auth:{
        signUp: '/users',
        sinIn: '/users/login',
        verifyEmail:'/users/verify',
        userProfile: 'users/profile',
    },
    users:{
        invitations: '/users/invitations',
        fetchUsers: '/users',
    },
    organizations: {
        create: '/organization',
        update: '/organization',
        getAll: '/organization',
        getById: '/organization',
        agentDedicatedSpinup: '/agent-service/spinup',
        agentSharedSpinup: '/agent-service/tenant',
        invitations: '/organization/invitations',
        orgRoles: '/organization/roles'
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById:'/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDeffBySchemaId: '/schemas/credential-definitions'
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

    }
}