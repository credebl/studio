export const pathRoutes = {
    auth: {
        signUp: '/authentication/sign-up',
        sinIn: '/authentication/sign-in',
        verifyEmail: '/users/verify',
    },
    users: {
        dashboard: '/dashboard',
        profile: '/profile',
        invitations: '/invitations',
        fetchUsers: '/users',
    },
    organizations: {
        root: '/organizations',
        invitations: '/organizations/invitations',
        users: '/organizations/users',
        credentials: '/organizations/credentials',
        schemas: `/organizations/schemas`,
        dashboard: '/organizations/dashboard',
        createSchema: '/organizations/schemas/create',
        viewSchema: '/organizations/schemas/view-schema'

    },
    ecosystems: {
        root: '/ecosystems',
        frameworks: '/ecosystems/frameworks',
        members: '/ecosystems/members',
        registries: '/ecosystems/registries',
        users: '/organizations/users',
        credentials: '/organizations/credentials'
    },
    documentation: {
        root: '/docs'
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById: '/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDeffBySchemaId: '/schemas/credential-definitions'
    }
}