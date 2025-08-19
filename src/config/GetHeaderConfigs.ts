const allowedDomains = process.env.PUBLIC_ALLOW_DOMAIN

type SecurityHeaders = {
  'Content-Security-Policy': string
  'X-Frame-Options': 'DENY' | 'SAMEORIGIN' | string
  'X-Content-Type-Options': 'nosniff' | string
  'Access-Control-Allow-Origin': string | undefined
  ServerTokens: 'Prod' | 'Major' | 'Minor' | 'Minimal' | 'OS' | 'Full' | string
  server_tokens: 'off' | 'on' | string
  server: string
  Server: string
  'Strict-Transport-Security': string
  'X-XSS-Protection': string
  'Content-Type'?: string
  Authorization?: string
  Referer?: string
  'Cache-Control'?: string
  Pragma?: string
}
export interface HeaderConfig {
  headers: SecurityHeaders
  withCredentials?: boolean
}

const commonHeaders: SecurityHeaders = {
  'Content-Security-Policy': `default-src 'self'; script-src 'unsafe-inline' ${allowedDomains}; style-src 'unsafe-inline' ${allowedDomains}; font-src ${allowedDomains}; img-src 'self' ${allowedDomains}; frame-src 'self' ${allowedDomains}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomains}; form-action 'self'; frame-ancestors 'self'; `,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Origin': allowedDomains,
  ServerTokens: 'Prod',
  server_tokens: 'off',
  server: 'SSI',
  Server: 'SSI',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
}

export const getHeaderConfigs = (): HeaderConfig => ({
  headers: {
    ...commonHeaders,
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
export const getHeaderConfigsForFormData = (): HeaderConfig => ({
  headers: {
    ...commonHeaders,
    'Content-Type': 'multipart/form-data',
  },
})
