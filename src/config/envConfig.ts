/* eslint-disable @typescript-eslint/no-unsafe-assignment */
let envVariables = globalThis || {}
try {
  if (process?.env) {
    envVariables = {
      ...envVariables,
      ...process?.env,
    }
  }
} catch (error) {
  // Handle the error if needed
}

if (process?.env) {
  envVariables = {
    ...envVariables,
    ...process?.env,
  }
}

const {
  NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL,
  NEXT_PUBLIC_POLYGON_TESTNET_URL,
  NEXT_PUBLIC_POLYGON_MAINNET_URL,
  NEXT_PUBLIC_CRYPTO_PRIVATE_KEY,
  NEXT_PUBLIC_PLATFORM_NAME,
  PUBLIC_PLATFORM_DOCS_URL,
  PUBLIC_ALLOW_DOMAIN,
  PUBLIC_ECOSYSTEM_BASE_URL,
  NEXT_PUBLIC_MODE,
  NEXT_PUBLIC_CURRENT_RELEASE,
  NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN,
  NEXT_PUBLIC_ENABLE_BILLING_OPTION,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any = envVariables

export const envConfig = {
  NEXT_PUBLIC_BASE_URL:
    NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL,
  PUBLIC_ECOSYSTEM_BASE_URL:
    PUBLIC_ECOSYSTEM_BASE_URL || process.env.PUBLIC_ECOSYSTEM_BASE_URL,
  NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL:
    NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL ||
    process.env.NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL,
  NEXT_PUBLIC_CRYPTO_PRIVATE_KEY:
    NEXT_PUBLIC_CRYPTO_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_CRYPTO_PRIVATE_KEY,
  PLATFORM_DATA: {
    version:
      NEXT_PUBLIC_CURRENT_RELEASE || process.env.NEXT_PUBLIC_CURRENT_RELEASE,
    enableSocialLogin:
      (NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN ||
        process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN) === 'true',
    enableBillingOption:
      (NEXT_PUBLIC_ENABLE_BILLING_OPTION ||
        process.env.NEXT_PUBLIC_ENABLE_BILLING_OPTION) === 'true',
    polygonTestnet:
      NEXT_PUBLIC_POLYGON_TESTNET_URL ||
      process.env.NEXT_PUBLIC_POLYGON_TESTNET_URL,
    polygonMainnet:
      NEXT_PUBLIC_POLYGON_MAINNET_URL ||
      process.env.NEXT_PUBLIC_POLYGON_MAINNET_URL,
    name: NEXT_PUBLIC_PLATFORM_NAME || process.env.NEXT_PUBLIC_PLATFORM_NAME,
    docs: PUBLIC_PLATFORM_DOCS_URL || process.env.PUBLIC_PLATFORM_DOCS_URL,
  },
  PUBLIC_ALLOW_DOMAIN: PUBLIC_ALLOW_DOMAIN || process.env.PUBLIC_ALLOW_DOMAIN,
  MODE: NEXT_PUBLIC_MODE || process.env.NEXT_PUBLIC_MODE,
}
