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

export const staorageKeys = {
    TOKEN : 'access_token',
    ORG_ID : 'organization_id',
    USER_PROFILE : 'user_profile',
    PERMISSIONS: 'user_permissions' 
}
