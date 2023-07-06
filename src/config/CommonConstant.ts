export const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[-!@$%^*])(?=.*[!"$%*,-.\/:;=@^_])[a-zA-Z0-9!"$%*,-.\/:;=@^_]{8,}$/ 
export const allowedPasswordChars = /[^a-zA-Z0-9\d!"$%*,-.\/:;=@^_]/g
export const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
export const imageSizeAccepted = 1 // mb
export const IMG_MAX_WIDTH = 500
export const IMG_MAX_HEIGHT = 291

export const schemaVersionRegex = /^\d{1,5}(?=.*[0-9])(?:\.\d{1,5})?(?:\.\d{1,5})?$/gm