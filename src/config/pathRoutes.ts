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
        schemas: `/organizations/schemas`,
        dashboard: '/organizations/dashboard',
        issuedCredentials: '/organizations/credentials-issued',
        credentials: '/organizations/verification',
        createSchema: '/organizations/schemas/create',
        viewSchema: '/organizations/schemas/view-schema',

        Issuance: {
            schema: '/organizations/credentials-issued/schemas',
            credDef:'/organizations/credentials-issued/schemas/cred-defs',
            connections:'/organizations/credentials-issued/schemas/cred-defs/connections',
            issuance:'/organizations/credentials-issued/schemas/cred-defs/connections/issuance'
        },
        verification: {
            schema: '/organizations/verification/schemas',
            credDef:'/organizations/verification/schemas/cred-defs',
            connections:'/organizations/verification/schemas/cred-defs/connections',
            verify:'/organizations/verification/schemas/cred-defs/connections/verification'
        },
    },
   
    // ecosystems: {
    //     root: '/ecosystems',
    //     frameworks: '/ecosystems/frameworks',
    //     members: '/ecosystems/members',
    //     registries: '/ecosystems/registries',
    //     users: '/organizations/users',
    //     credentials: '/organizations/credentials'
    // },
    documentation: {
        root: 'https://docs.credebl.id'
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById: '/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDeffBySchemaId: '/schemas/credential-definitions'
    },

		back:{
			schema:{
				schemas:'/organizations/schemas'
			},
			verification:{
				credDef:'/organizations/verification/schemas/cred-defs',
				schemas:'/organizations/verification/schemas',
				verification:'/organizations/verification/schemas/cred-defs/connections',
			},
			issuance:{
				credDef:'/organizations/credentials-issued/schemas/cred-defs',
				schemas:'/organizations/credentials-issued/schemas',
				connections: '/organizations/credentials-issued/schemas/cred-defs/connections'
			}
		}
}
