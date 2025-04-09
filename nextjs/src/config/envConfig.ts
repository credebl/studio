let envVariables = globalThis || {}
try {
	if (process?.env) {
		envVariables = {
			...envVariables,
			...process?.env
		}
	}
} catch (error) {
	
}

if (process?.env) {
	envVariables = {
		...envVariables,
		...process?.env
	}
}

const { NEXT_PUBLIC_BASE_URL, PUBLIC_ECOSYSTEM_FRONT_END_URL, PUBLIC_POLYGON_TESTNET_URL, PUBLIC_POLYGON_MAINNET_URL, PUBLIC_CRYPTO_PRIVATE_KEY,PUBLIC_SHOW_NAME_AS_LOGO, PUBLIC_PLATFORM_NAME, PUBLIC_PLATFORM_LOGO, PUBLIC_POWERED_BY, PUBLIC_PLATFORM_WEB_URL, PUBLIC_PLATFORM_DOCS_URL, PUBLIC_PLATFORM_GIT, PUBLIC_PLATFORM_TWITTER_URL, PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID, PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET, PUBLIC_PLATFROM_DISCORD_SUPPORT, PUBLIC_PLATFORM_DISCORD_URL, PUBLIC_ALLOW_DOMAIN, PUBLIC_ECOSYSTEM_BASE_URL, PUBLIC_MODE, PUBLIC_REDIRECT_FROM_URL, PUBLIC_REDIRECTION_TARGET_URL }: any = envVariables;

export const envConfig = {
	NEXT_PUBLIC_BASE_URL:
		NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL,
	PUBLIC_ECOSYSTEM_BASE_URL:
	PUBLIC_ECOSYSTEM_BASE_URL || process.env.PUBLIC_ECOSYSTEM_BASE_URL,	
	PUBLIC_ECOSYSTEM_FRONT_END_URL:
		PUBLIC_ECOSYSTEM_FRONT_END_URL || process.env.PUBLIC_ECOSYSTEM_FRONT_END_URL,
	PUBLIC_CRYPTO_PRIVATE_KEY:
		PUBLIC_CRYPTO_PRIVATE_KEY ||
		process.env.PUBLIC_CRYPTO_PRIVATE_KEY,
	PLATFORM_DATA: {
		nameAsLogo:
		PUBLIC_SHOW_NAME_AS_LOGO || process.env.PUBLIC_SHOW_NAME_AS_LOGO,

		polygonTestnet:
		PUBLIC_POLYGON_TESTNET_URL || process.env.PUBLIC_POLYGON_TESTNET_URL,

		polygonMainnet:
		PUBLIC_POLYGON_MAINNET_URL || process.env.PUBLIC_POLYGON_MAINNET_URL,

		name:
			PUBLIC_PLATFORM_NAME || process.env.PUBLIC_PLATFORM_NAME,
		logo:
			PUBLIC_PLATFORM_LOGO || process.env.PUBLIC_PLATFORM_LOGO,
		poweredBy:
			PUBLIC_POWERED_BY || process.env.PUBLIC_POWERED_BY,
		webUrl:
			PUBLIC_PLATFORM_WEB_URL ||
			process.env.PUBLIC_PLATFORM_WEB_URL,
		docs:
			PUBLIC_PLATFORM_DOCS_URL ||
			process.env.PUBLIC_PLATFORM_DOCS_URL,
		git:
			PUBLIC_PLATFORM_GIT ||
			process.env.PUBLIC_PLATFORM_GIT,
		twitter:
			PUBLIC_PLATFORM_TWITTER_URL ||
			process.env.PUBLIC_PLATFORM_TWITTER_URL,
		discord:
			PUBLIC_PLATFORM_DISCORD_URL ||
			process.env.PUBLIC_PLATFORM_DISCORD_URL,
		clientId:
		    PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID ||
			process.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID,
		clientSecret:
		    PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET ||
			process.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET,
	},
	PUBLIC_ALLOW_DOMAIN: PUBLIC_ALLOW_DOMAIN || process.env.PUBLIC_ALLOW_DOMAIN,
	PUBLIC_PLATFROM_DISCORD_SUPPORT: PUBLIC_PLATFROM_DISCORD_SUPPORT || process.env.PUBLIC_PLATFROM_DISCORD_SUPPORT,
	MODE: PUBLIC_MODE || process.env.PUBLIC_MODE,
	PUBLIC_REDIRECT_FROM_URL: PUBLIC_REDIRECT_FROM_URL || process.env.PUBLIC_REDIRECT_FROM_URL,
	PUBLIC_REDIRECTION_TARGET_URL: PUBLIC_REDIRECTION_TARGET_URL || process.env.PUBLIC_REDIRECTION_TARGET_URL, 
}