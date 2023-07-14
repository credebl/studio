export const apiRoutes = {
    auth:{
        signUp: '/users',
        sinIn: '/users/login',
        verifyEmail:'/users/verify'
    },
    organizations: {
        create: '/organization',
        getAll: '/organization',
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById:'/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDeffBySchemaId: '/schemas/credential-definitions'
    }
}