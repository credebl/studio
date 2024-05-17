import { getFromLocalStorage } from '../api/Auth';
import { storageKeys } from './CommonConstant';
import { envConfig } from './envConfig';

const allowedDomains = envConfig.PUBLIC_ALLOW_DOMAIN;
const commonHeaders = {
    'Content-Security-Policy': `default-src 'self'; script-src 'unsafe-inline' ${allowedDomains}; style-src 'unsafe-inline' ${allowedDomains}; font-src ${allowedDomains}; img-src 'self' ${allowedDomains}; frame-src 'self' ${allowedDomains}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomains}; form-action 'self'; frame-ancestors 'self'; `,
    'X-Frame-Options': "DENY",
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': allowedDomains,
    'ServerTokens': 'Prod',
    'server_tokens': 'off',
    'server': 'SSI',
    'Server': 'SSI',
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block"
}

export const getHeaderConfigs = async (tokenVal?: string) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN) || (typeof tokenVal === "string" ? tokenVal : "")
    
    return {
        headers: {
            ...commonHeaders,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    }

}
export const getHeaderConfigsForFormData = async () => {
    const token = await getFromLocalStorage(storageKeys.TOKEN)

    return {
        headers: {
            ...commonHeaders,
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
        }
    }

}
