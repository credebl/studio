export const apiRoutes = {
  auth: {
    sendMail: '/auth/verification-mail',
    sinIn: '/auth/signin',
    signOut: '/auth/signout',
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
    resetPasswordEndpoint: 'auth/reset-password', // NOSONAR
    forgotPasswordEndpoint: 'auth/forgot-password', // NOSONAR
    resetPasswordPath: 'auth/password-reset', // NOSONAR
    refreshToken: '/auth/refresh-token',
    fetchSessionDetails: '/auth/sessionDetails',
    userSessions: '/auth/userId:/sessions',
    deleteSession: '/auth/sessionId:/sessions',
  },

  users: {
    userProfile: '/users/profile',
    checkUser: '/users/',
    invitations: '/users/org-invitations',
    fetchUsers: '/users',
    update: '/users',
    recentActivity: '/users/activity',
    platformSettings: '/users/platform-settings',
  },

  Ecosystem: {
    root: '/ecosystem',
    usersInvitation: '/users/invitations',
    endorsements: {
      list: '/endorsement-transactions',
      createSchemaRequest: '/transaction/schema',
    },
  },

  geolocation: {
    root: '/geolocation',
    countries: '/countries',
    state: '/states',
    cities: '/cities',
  },

  schema: {
    create: '/schemas',
    getAll: '/schemas',
    getSchemaById: '/schemas',
    createCredentialDefinition: '/cred-defs',
    getCredDefBySchemaId: '/schemas',
  },
  Verification: {
    getAllRequestList: '/credentials/proofs',
    verifyCredential: '/proofs',
    oobProofRequest: '/proofs/oob',
    presentationVerification: '/proofs',
    proofRequestAttributesVerification: '/verified-proofs',
    verificationCredDef: '/verifiation/cred-defs',
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
    primaryDid: '/primary-did',
    getOrgReferences: '/activity-count',
    deleteOrganization: '/deleteorganizations',
    deleteVerifications: '/verification-records',
    deleteIssaunce: '/issuance-records',
    deleteConnections: '/connections',
  },
  connection: {
    create: '/connections',
  },

  Issuance: {
    getIssuedCredentials: '/credentials',
    getAllConnections: '/connections',
    issueCredential: '/credentials/offer',
    issueOobEmailCredential: '/credentials/oob/email',
    bulk: {
      credefList: '/credentials/bulk/template',
      uploadCsv: '/bulk/upload',
      preview: '/preview',
      bulk: '/bulk',
      files: '/bulk/files',
      filesData: '/bulk/file-data',
      retry: '/retry/bulk',
    },
    download: '/credentials/bulk/template',
  },

  Platform: {
    getAllSchemaFromPlatform: '/platform/schemas',
    getLedgers: '/platform/ledgers',
    getLedgerPlatformUrl: '/platform/network/url/',
  },
  Public: {
    organizations: '/orgs/public-profile',
    organizationDetails: '/orgs/public-profiles',
  },
  Agent: {
    checkAgentHealth: '/agents/health',
    agentDedicatedSpinup: '/agents/spinup',
    agentSharedSpinup: '/agents/wallet',
    getLedgerConfig: '/agents/ledgerConfig',
    createPolygonKeys: '/agents/polygon/create-keys',
    setAgentConfig: '/agents/configure',
    deleteWallet: '/agents/wallet',
  },

  setting: {
    setting: '/client_credentials',
  },
}
