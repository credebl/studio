export const passwordRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!"$%*,./:;=@^_\-])[A-Za-z\d!"$%*,./:;=@^_\-]{8,}$/
export const allowedPasswordChars = /[^a-zA-Z0-9!"$%*,-.:;=@^_]/g
export const phoneRegExp = /^[+]?(\d{1,4})?[-\s./\d]*$/
export const imageSizeAccepted = 1 // mb
export const IMG_MAX_WIDTH = 500
export const IMG_MAX_HEIGHT = 291
export const emailRegex = /(\.[a-zA-Z]{2,})$/
export const CREDENTIAL_CONTEXT_VALUE = 'https://www.w3.org/2018/credentials/v1'
export const schemaVersionRegex = /^\d{1,5}(?:\.\d{1,5})?(?:\.\d{1,5})?$/
export const proofPurpose = 'assertionMethod'
export const limitedAttributesLength = 3
export const itemPerPage = 10
export const pageIndex = 0
export const pageCount = 1
export const allSchemas = 'All schemas'
export const polygonScan = 'https://mumbai.polygonscan.com/'
export const createDateTime = 'createDateTime'
export const totalRecords = 'totalRecords'
export const successfulRecords = 'successfulRecords'
export const currentPageNumber = 1
export const sortBy = 'createdAt'
export const sortOrder = 'desc'
export const polygonFaucet = 'https://faucet.polygon.technology/'
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const URL_REGEX_PATTERN =
  /^(https?:\/\/)(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/

export const KEY_TYPES = {
  P_256: 'P-256',
  P256: 'p256',
  ED25519: 'ed25519',
}
export const sanRegexPattern = /DNS:([^,\n]+)/g
export const cnRegexPattern = /CN\s*=\s*([^,\n]+)/

export const apiStatusCodes = {
  API_STATUS_SUCCESS: 200,
  API_STATUS_CREATED: 201,
  API_STATUS_DELETED: 202,
  API_STATUS_PARTIALLY_COMPLETED: 206,
  API_STATUS_BAD_REQUEST: 400,
  API_STATUS_UNAUTHORIZED: 401,
  API_STATUS_NOT_FOUND: 404,
  API_STATUS_SERVER_ERROR: 500,
}

export const storageKeys = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ORG_ID: 'orgId',
  ORG_ROLES: 'org_roles',
  USER_PROFILE: 'user_profile',
  PERMISSIONS: 'user_permissions',
  USER_EMAIL: 'user_email',
  SELECTED_USER: 'selected_user',
  CRED_DEF_DATA: 'CRED_DEF_DATA',
  SELECTED_CONNECTIONS: 'selected_connections',
  SCHEMA_ID: 'schema_id',
  W3C_SCHEMA_DATA: 'w3cSchemaDetails',
  W3C_SCHEMA_ATTRIBUTES: 'w3c_schema_attributes',
  SCHEMA_ATTR: 'schema_attr',
  W3C_SCHEMA_DETAILS: 'schemaDetails',
  CRED_DEF_ID: 'cred_def_id',
  SCHEMA_DID: 'schema_did',
  LOGIN_USER_EMAIL: 'login_user_email',
  ORG_DETAILS: 'org_details',
  SCHEMA_IDS: 'schemaIds',
  SCHEMA_ATTRIBUTES: 'schema_attributes',
  SCHEMA_CRED_DEFS: 'schema_cred_defs',
  ATTRIBUTE_DATA: 'attribute_data',
  SELECTED_SCHEMAS: 'selectedSchemas',
  SOCKET_ID: 'socket_id',
  LEDGER_ID: 'ledger_id',
  ORG_INFO: 'organization_Info',
  ORG_DID: 'did',
  SCHEMA_TYPE: 'type',
  ALL_SCHEMAS: 'allSchemaFlag',
  ECOSYSTEM_ID: 'ecosystem_id',
  ECOSYSTEM_ROLE: 'ecosystem_role',
  VERIFICATION_ROUTE_TYPE: 'routeType',
}

export const emailCredDefHeaders = [
  { columnName: 'Cred def name' },
  { columnName: 'Schema name' },
  { columnName: 'Revocable' },
]

export const predicatesConditions = [
  { value: 'Select', label: 'Select' },
  { value: '>', label: 'Greater than' },
  { value: '<', label: 'Less than' },
  { value: '>=', label: 'Greater than or equal to' },
  { value: '<=', label: 'Less than or equal to' },
]

export const avatarColorPairs = [
  {
    text: '#ea5455',
    background: '#fceaea',
  },
  {
    text: '#b8b2f7',
    background: '#eeecfe',
  },
  {
    text: '#c1c2c5',
    background: '#f0f0f1',
  },
  {
    text: '#82ddaa',
    background: '#e5f8ed',
  },
  {
    text: '#f4a651',
    background: '#fdf3e8',
  },
  {
    text: '#76ddef',
    background: '#e0f9fd',
  },
]

export const sessionExcludedPaths = [
  '/sign-in',
  '/sign-up',
  '/verify-email-success',
  '/reset-password',
]

const imageBasePath = '/images'

export const CredeblLogo = `${imageBasePath}/CREDEBL_Logo_Web.svg`
export const signInImg = `${imageBasePath}/signin.svg`
export const closeIconImg = `${imageBasePath}/close_icon.svg`
export const CredeblLogoWidth = 170
export const CredeblLogoHeight = 140

export const signInWidth = 500
export const signInHeight = 500

export const stepLabels = [
  'Organization',
  'Wallet setup',
  'DID setup',
  'Completed',
]

export const confirmationMessages = {
  deletePendingInvitationConfirmation:
    'Would you like to proceed? Keep in mind that this action cannot be undone.',
  sureConfirmation: 'Yes, I am sure',
  cancelConfirmation: 'No, cancel',
}

export const formikAddButtonStyles = {
  height: '2rem',
  width: '10rem',
  minWidth: '2rem',
}

export const fieldArrayLabelStyles = {
  minWidth: '80px',
}

export const labelRed = {
  color: 'red',
}

export const credDefHeader = [
  { columnName: 'Select' },
  { columnName: 'Name' },
  { columnName: 'Credential definition Id' },
  { columnName: 'Revocable' },
]
export const fieldCardStyles = {
  maxWidth: '100%',
  maxHeight: '100%',
  overflow: 'auto',
}

export enum RoleNames {
  OWNER = 'owner',
  HOLDER = 'holder',
  MEMBER = 'member',
}

export const optionsSchemaCreation = [
  {
    value: 'string',
    label: 'String',
  },
  {
    value: 'number',
    label: 'Number',
  },
  {
    value: 'time',
    label: 'Time',
  },
  {
    value: 'datetime-local',
    label: 'Date & Time',
  },
]

export const createSchemaStyles = {
  createButton: {
    height: '2.6rem',
    width: 'auto',
    minWidth: '2rem',
  },
  resetButton: {
    height: '2.6rem',
    width: '6rem',
    minWidth: '2rem',
  },
}

export const schemaDetailsInitialState = {
  schemaName: '',
  version: '',
  schemaId: '',
  credDefId: '',
}

export const issuanceApiParameter = {
  itemPerPage,
  page: 1,
  search: '',
  sortBy: 'id',
  sortingOrder: 'desc',
  allSearch: '',
}

export const bulkIssuanceApiParameter = {
  itemPerPage,
  page: 1,
  search: '',
  sortBy: 'id',
  sortingOrder: 'desc',
  allSearch: '',
}

export const defaultCredeblFooterText = 'CREDEBL, a Series of LF Projects, LLC'

export const InfoText = {
  DIDCommInfoText:
    'DIDComm provides secure messaging between agents and credential exchange.',
  OID4VCInfoText:
    'OID4VC is a suite of specifications that standardizes the issuance and presentation of digital credentials using OAuth 2.0 and OpenID Connect protocols',
  AnonCredsInfoText:
    'AnonCreds enables privacy-preserving credentials using zero-knowledge proofs.',
  W3CInfoText: 'W3C VCDM defines interoperable Verifiable Credentials.',
  MDOCInfoText: 'MDOC follows ISO/IEC mobile identity standard.',
  SDJWTInfoText: 'SD-JWT supports selective disclosure JWT credentials.',
}

export const confirmationCertificateMessages = {
  activateCertificateConfirmation:
    'Are you sure you want to activate this certificate?',
  deactivateCertificateConfirmation:
    'Are you sure you want to deactivate this certificate?',
  deleteCertificateConfirmation:
    'Are you sure you want to delete this certificate?',
}
