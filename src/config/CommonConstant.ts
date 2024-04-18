export const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[-!@$%^*])(?=.*[!"$%*,-.\/:;=@^_])[a-zA-Z0-9!"$%*,-.\/:;=@^_]{8,}$/ 
export const allowedPasswordChars = /[^a-zA-Z0-9\d!"$%*,-.\/:;=@^_]/g
export const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
export const imageSizeAccepted = 1 // mb
export const IMG_MAX_WIDTH = 500
export const IMG_MAX_HEIGHT = 291
export const emailRegex = /(\.[a-zA-Z]{2,})$/
export const CREDENTIAL_CONTEXT_VALUE = 'https://www.w3.org/2018/credentials/v1'
export const schemaVersionRegex = /^\d{1,5}(?=.*[0-9])(?:\.\d{1,5})?(?:\.\d{1,5})?$/gm
export const proofPurpose = 'assertionMethod'
export const limitedAttributesLength = 3
export const itemPerPage = 9

export const apiStatusCodes = {
    API_STATUS_SUCCESS : 200,
    API_STATUS_CREATED : 201,
	API_STATUS_DELETED : 202,
	API_STATUS_PARTIALLY_COMPLETED : 206,
    API_STATUS_BAD_REQUEST : 400,
    API_STATUS_UNAUTHORIZED : 401,
    API_STATUS_NOT_FOUND : 404
}

export const storageKeys = {
    TOKEN : 'access_token',
    REFRESH_TOKEN : 'refresh_token',
    ORG_ID: 'orgId',
    ORG_ROLES: 'org_roles',
    USER_PROFILE : 'user_profile',
    PERMISSIONS: 'user_permissions',
    USER_EMAIL: 'user_email',
	SELECTED_USER:'selected_user',
    CRED_DEF_DATA: 'CRED_DEF_DATA',
    SELECTED_CONNECTIONS: 'selected_connections',
	SCHEMA_ID:'schema_id',
    W3C_SCHEMA_DATA:'w3cSchemaDetails',
    W3C_SCHEMA_ATTRIBUTES: 'w3c_schema_attributes',
    SCHEMA_ATTR:'schema_attr',
    W3C_SCHEMA_DETAILS:'schemaDetails',
	CRED_DEF_ID:'cred_def_id',
    SCHEMA_DID: 'schema_did',
    LOGIN_USER_EMAIL: 'login_user_email',
	ECOSYSTEM_ID: "ecosystem_id",
    ORG_DETAILS: "org_details",
    ECOSYSTEM_ROLE: "ecosystem_role",
    SCHEMA_IDS: "schemaIds",
    SCHEMA_ATTRIBUTES: "schema_attributes",
    SCHEMA_CRED_DEFS: "schema_cred_defs",
    ATTRIBUTE_DATA: "attribute_data",
    SELECTED_SCHEMAS:'selectedSchemas',
	SOCKET_ID: "socket_id",
	LEDGER_ID: "ledger_id", 
	ORG_INFO:'organization_Info',
    ORG_DID:'did',
    SCHEMA_TYPE:'type',
    SELECT_ORG_IN_ECOSYSTEM: 'select_orgs_in_ecosystem',
    ERROR_ORG_IN_ECOSYSTEM: 'error_orgs_in_ecosystem',
    ALL_SCHEMAS:'allSchemaFlag'
}

export const emailCredDefHeaders = [
    { columnName: 'Cred def name' },
    { columnName: 'Schema name' },
    { columnName: 'Revocable' },
];

export const predicatesConditions = [
    { value: '', label: 'Select' },
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '>=', label: 'Greater than or equal to' },
    { value: '<=', label: 'Less than or equal to' }
]
export const allowedDomains = "https://credebl-prod-user-certificate.s3.ap-south-1.amazonaws.com https://prod-org-logo.s3.ap-south-1.amazonaws.com https://dev-service.ngotag.com wss://dev-service.ngotag.com https://cdnjs.cloudflare.com https://tailwindcss.com https://www.blockster.global https://www.ayanworks.com https://qaapi.credebl.id https://devapi.credebl.id https://api.credebl.id https://*.credebl.id https://fonts.googleapis.com https://fonts.gstatic.com https://avatars.githubusercontent.com  https://dev-org-logo.s3.ap-south-1.amazonaws.com https://flowbite-admin-dashboard.vercel.app/ wss://devapi.credebl.id wss://qaapi.credebl.id wss://api.credebl.id wss://*.credebl.id  https://qa.credebl.id https://dev.credebl.id https://credebl.id"
