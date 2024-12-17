/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// https://docs.astro.build/en/guides/environment-variables/#intellisense-for-typescript
interface ImportMetaEnv {
	readonly SITE: string;
	readonly PUBLIC_BASE_URL:string;
	readonly PUBLIC_CRYPTO_PRIVATE_KEY: string;
	readonly PUBLIC_ECOSYSTEM_BASE_URL: string;
	readonly PUBLIC_REDIRECT_FROM_URL: string;
	readonly PUBLIC_POLYGON_TESTNET_URL: string;
	readonly PUBLIC_POLYGON_MAINNET_URL: string;
	readonly PUBLIC_SHOW_NAME_AS_LOGO: string;
	readonly PUBLIC_PLATFORM_NAME: string, 
	readonly PUBLIC_PLATFORM_LOGO: string, 
	readonly PUBLIC_POWERED_BY: string, 
	readonly PUBLIC_PLATFORM_WEB_URL: string, 
	readonly PUBLIC_POWERED_BY_URL: string, 
	readonly PUBLIC_PLATFORM_DOCS_URL: string, 
	readonly PUBLIC_PLATFORM_GIT: string, 
	readonly PUBLIC_PLATFORM_SUPPORT_EMAIL: string, 
	readonly PUBLIC_PLATFORM_TWITTER_URL: string, 
	readonly PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID: string, 
	readonly PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET: string, 
	readonly PUBLIC_PLATFORM_SUPPORT_INVITE: string, 
	readonly PUBLIC_PLATFORM_DISCORD_URL: string, 
	readonly PUBLIC_ALLOW_DOMAIN: string, 
	readonly PUBLIC_ECOSYSTEM_BASE_URL: string, 
	readonly PUBLIC_MODE: string, 
	readonly PUBLIC_REDIRECT_FROM_URL: string, 
	readonly PUBLIC_REDIRECTION_TARGET_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	var baseUrl: string;
	var encryptKey: string;
	var supabaseUrl: string;
	var supabaseKey: string;
	var supabaseSecret: string;
}

export { };