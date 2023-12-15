export const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[-!@$%^*])(?=.*[!"$%*,-.\/:;=@^_])[a-zA-Z0-9!"$%*,-.\/:;=@^_]{8,}$/ 
export const allowedPasswordChars = /[^a-zA-Z0-9\d!"$%*,-.\/:;=@^_]/g
export const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
export const imageSizeAccepted = 1 // mb
export const IMG_MAX_WIDTH = 500
export const IMG_MAX_HEIGHT = 291

export const schemaVersionRegex = /^\d{1,5}(?=.*[0-9])(?:\.\d{1,5})?(?:\.\d{1,5})?$/gm

export const apiStatusCodes = {
    API_STATUS_SUCCESS : 200,
    API_STATUS_CREATED : 201,
    API_STATUS_BAD_REQUEST : 400,
    API_STATUS_UNAUTHORIZED : 401,
    API_STATUS_NOT_FOUND : 404
}

export const storageKeys = {
    TOKEN : 'access_token',
    ORG_ID: 'orgId',
    ORG_ROLES: 'org_roles',
    USER_PROFILE : 'user_profile',
    PERMISSIONS: 'user_permissions',
    USER_EMAIL: 'user_email',
	SELECTED_USER:'selected_user',
	SCHEMA_ID:'schema_id',
    SCHEMA_ATTR:'schema_attr',
	CRED_DEF_ID:'cred_def_id',
    SCHEMA_DID: 'schema_did',
    LOGIN_USER_EMAIL: 'login_user_email',
	ECOSYSTEM_ID: "ecosystem_id",
    ORG_DETAILS: "org_details",
    ECOSYSTEM_ROLE: "ecosystem_role",
	SOCKET_ID: "socket_id",
	LEDGER_ID: "ledger_id" 
}
