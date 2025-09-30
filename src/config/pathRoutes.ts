export const pathRoutes = {
  landingPage: {
    landingPage: '/',
  },
  auth: {
    signUp: '/authentication/sign-up',
    sinIn: '/sign-in',
    verifyEmail: '/verify',
  },
  users: {
    dashboard: '/dashboard',
    profile: '/profile',
    invitations: '/invitations',
    orgInvitations: '/invitations',
    fetchUsers: '/users',
    connectionList: '/connections',
    platformSetting: '/platform-settings',
    setting: '/setting',
  },
  ecosystem: {
    root: '/ecosystems',
    ecosystemLogin: '/authentication/sign-in',
  },
  organizations: {
    root: '/organizations',
    invitations: '/invitations',
    users: '/users',
    schemas: '/schemas',
    dashboard: '/dashboard',
    issuedCredentials: '/credentials',
    credentials: '/verification',
    createSchema: '/schemas/create',
    deleteOrganization: '/delete-organizations',

    viewSchema: '/schemas',
    Issuance: {
      issue: '/credentials/issue',
      schema: '/credentials/issue/schemas',
      credDef: '/credentials/issue/schemas/cred-defs',
      connection: '/credentials/connections',
      connections: '/credentials/connections',
      issuance: '/credentials/connections/issuance',
      w3cIssuance: '/credentials/issue/connections/issuance',
      history: '/credentials/issue/bulk-issuance/history',
      details: '/credentials/issue/bulk-issuance/history/details',
      bulkIssuance: '/credentials/issue/bulk-issuance',
      email: '/credentials/issue/email',
      emailHistory: '/credentials/issue/email/history',
    },
    verification: {
      requestProof: '/verification/verify-credentials',
      email: '/verification/verify-credentials/schema',
      schema: '/verification/verify-credentials/schemas',
      credDef: '/verification/verify-credentials/schemas/cred-defs',
      w3cAttributes: '/verification/verify-credentials/schema/attributes',
      attributes:
        '/verification/verify-credentials/schema/cred-defs/attributes',
      emailVerification:
        '/verification/verify-credentials/schema/cred-defs/attributes/verification-email',
      w3cEmailVerification:
        '/verification/verify-credentials/schema/attributes/verification-email',
      emailCredDef: '/verification/verify-credentials/schema/cred-defs',
      connections:
        '/verification/verify-credentials/schemas/cred-defs/connections',
      W3CConnections: '/verification/verify-credentials/schemas/connections',

      verify:
        '/verification/verify-credentials/schemas/cred-defs/connections/verification',
      W3CVerification:
        '/verification/verify-credentials/schemas/connections/verification',
    },
  },
  documentation: {
    root: process.env.PUBLIC_PLATFORM_DOCS_URL as string,
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
      schemas: '/schemas',
    },
    verification: {
      credDef: '/verification/verify-credentials/schemas/cred-defs',
      schemas: '/verification/verify-credentials/schemas',
      verification:
        '/verification/verify-credentials/schemas/cred-defs/connections',
    },
    issuance: {
      credDef: '/credentials/issue/schemas/cred-defs',
      schemas: '/credentials/issue/schemas',
      connections: '/credentials/connections',
      issue: '/credentials/issue',
    },
    credentials: {
      credentials: '/credentials',
    },
  },
}
