// let envVariables = globalThis || {}
// try {
// 	if (process?.env) {
// 		envVariables = {
// 			...envVariables,
// 			...process?.env
// 		}
// 	}
// } catch (error) {
	
// }

// if (import.meta.env) {
// 	envVariables = {
// 		...envVariables,
// 		...import.meta.env
// 	}
// }

// const { PUBLIC_BASE_URL, PUBLIC_ECOSYSTEM_FRONT_END_URL, PUBLIC_POLYGON_TESTNET_URL, PUBLIC_POLYGON_MAINNET_URL, PUBLIC_CRYPTO_PRIVATE_KEY,PUBLIC_SHOW_NAME_AS_LOGO, PUBLIC_PLATFORM_NAME, PUBLIC_PLATFORM_LOGO, PUBLIC_POWERED_BY, PUBLIC_PLATFORM_WEB_URL, PUBLIC_POWERED_BY_URL, PUBLIC_PLATFORM_DOCS_URL, PUBLIC_PLATFORM_GIT, PUBLIC_PLATFORM_SUPPORT_EMAIL, PUBLIC_PLATFORM_TWITTER_URL, PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID, PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET, PUBLIC_PLATFORM_SUPPORT_INVITE, PUBLIC_PLATFORM_DISCORD_URL, PUBLIC_ALLOW_DOMAIN, PUBLIC_ECOSYSTEM_BASE_URL, PUBLIC_MODE, PUBLIC_REDIRECT_FROM_URL, PUBLIC_REDIRECTION_TARGET_URL }: any = envVariables;

// export const envConfig = {
// 	PUBLIC_BASE_URL:
// 		PUBLIC_BASE_URL || import.meta.env.PUBLIC_BASE_URL,
// 	PUBLIC_ECOSYSTEM_BASE_URL:
// 	PUBLIC_ECOSYSTEM_BASE_URL || import.meta.env.PUBLIC_ECOSYSTEM_BASE_URL,	
// 	PUBLIC_ECOSYSTEM_FRONT_END_URL:
// 		PUBLIC_ECOSYSTEM_FRONT_END_URL || import.meta.env.PUBLIC_ECOSYSTEM_FRONT_END_URL,
// 	PUBLIC_CRYPTO_PRIVATE_KEY:
// 		PUBLIC_CRYPTO_PRIVATE_KEY ||
// 		import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY,
// 	PLATFORM_DATA: {
// 		nameAsLogo:
// 		PUBLIC_SHOW_NAME_AS_LOGO || import.meta.env.PUBLIC_SHOW_NAME_AS_LOGO,

// 		polygonTestnet:
// 		PUBLIC_POLYGON_TESTNET_URL || import.meta.env.PUBLIC_POLYGON_TESTNET_URL,

// 		polygonMainnet:
// 		PUBLIC_POLYGON_MAINNET_URL || import.meta.env.PUBLIC_POLYGON_MAINNET_URL,

// 		name:
// 			PUBLIC_PLATFORM_NAME || import.meta.env.PUBLIC_PLATFORM_NAME,
// 		logo:
// 			PUBLIC_PLATFORM_LOGO || import.meta.env.PUBLIC_PLATFORM_LOGO,
// 		poweredBy:
// 			PUBLIC_POWERED_BY || import.meta.env.PUBLIC_POWERED_BY,
// 		webUrl:
// 			PUBLIC_PLATFORM_WEB_URL ||
// 			import.meta.env.PUBLIC_PLATFORM_WEB_URL,
// 		orgUrl:
// 			PUBLIC_POWERED_BY_URL ||
// 			import.meta.env.PUBLIC_POWERED_BY_URL,
// 		docs:
// 			PUBLIC_PLATFORM_DOCS_URL ||
// 			import.meta.env.PUBLIC_PLATFORM_DOCS_URL,
// 		git:
// 			PUBLIC_PLATFORM_GIT ||
// 			import.meta.env.PUBLIC_PLATFORM_GIT,
// 		support:
// 			PUBLIC_PLATFORM_SUPPORT_EMAIL ||
// 			import.meta.env.PUBLIC_PLATFORM_SUPPORT_EMAIL,
// 		twitter:
// 			PUBLIC_PLATFORM_TWITTER_URL ||
// 			import.meta.env.PUBLIC_PLATFORM_TWITTER_URL,
// 		discord:
// 			PUBLIC_PLATFORM_DISCORD_URL ||
// 			import.meta.env.PUBLIC_PLATFORM_DISCORD_URL,
// 		clientId:
// 		    PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID ||
// 			import.meta.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID,
// 		clientSecret:
// 		    PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET ||
// 			import.meta.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET,
// 	},
// 	PUBLIC_ALLOW_DOMAIN: PUBLIC_ALLOW_DOMAIN || import.meta.env.PUBLIC_ALLOW_DOMAIN,
// 	MODE: PUBLIC_MODE,
// 	PUBLIC_REDIRECT_FROM_URL: PUBLIC_REDIRECT_FROM_URL || import.meta.env.PUBLIC_REDIRECT_FROM_URL,
// 	PUBLIC_REDIRECTION_TARGET_URL: PUBLIC_REDIRECTION_TARGET_URL || import.meta.env.PUBLIC_REDIRECTION_TARGET_URL 
// }

let envVariables: any = globalThis || {};

try {
    if (process?.env) {
        envVariables = { ...envVariables, ...process.env };
    }
} catch (error) {
    console.error('Error loading process.env', error);
}

if (import.meta.env) {
    envVariables = { ...envVariables, ...import.meta.env };
}

export const envConfig = (() => {
    return {
        PUBLIC_BASE_URL: envVariables.PUBLIC_BASE_URL || import.meta.env.PUBLIC_BASE_URL,
        PUBLIC_ECOSYSTEM_BASE_URL: envVariables.PUBLIC_ECOSYSTEM_BASE_URL || import.meta.env.PUBLIC_ECOSYSTEM_BASE_URL,	
        PUBLIC_ECOSYSTEM_FRONT_END_URL: envVariables.PUBLIC_ECOSYSTEM_FRONT_END_URL || import.meta.env.PUBLIC_ECOSYSTEM_FRONT_END_URL,
        PUBLIC_CRYPTO_PRIVATE_KEY: envVariables.PUBLIC_CRYPTO_PRIVATE_KEY || import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY,
        PLATFORM_DATA: {
            nameAsLogo: envVariables.PUBLIC_SHOW_NAME_AS_LOGO || import.meta.env.PUBLIC_SHOW_NAME_AS_LOGO,
            polygonTestnet: envVariables.PUBLIC_POLYGON_TESTNET_URL || import.meta.env.PUBLIC_POLYGON_TESTNET_URL,
            polygonMainnet: envVariables.PUBLIC_POLYGON_MAINNET_URL || import.meta.env.PUBLIC_POLYGON_MAINNET_URL,
            name: envVariables.PUBLIC_PLATFORM_NAME || import.meta.env.PUBLIC_PLATFORM_NAME,
            logo: envVariables.PUBLIC_PLATFORM_LOGO || import.meta.env.PUBLIC_PLATFORM_LOGO,
            poweredBy: envVariables.PUBLIC_POWERED_BY || import.meta.env.PUBLIC_POWERED_BY,
            webUrl: envVariables.PUBLIC_PLATFORM_WEB_URL || import.meta.env.PUBLIC_PLATFORM_WEB_URL,
            orgUrl: envVariables.PUBLIC_POWERED_BY_URL || import.meta.env.PUBLIC_POWERED_BY_URL,
            docs: envVariables.PUBLIC_PLATFORM_DOCS_URL || import.meta.env.PUBLIC_PLATFORM_DOCS_URL,
            git: envVariables.PUBLIC_PLATFORM_GIT || import.meta.env.PUBLIC_PLATFORM_GIT,
            support: envVariables.PUBLIC_PLATFORM_SUPPORT_EMAIL || import.meta.env.PUBLIC_PLATFORM_SUPPORT_EMAIL,
            twitter: envVariables.PUBLIC_PLATFORM_TWITTER_URL || import.meta.env.PUBLIC_PLATFORM_TWITTER_URL,
            discord: envVariables.PUBLIC_PLATFORM_DISCORD_URL || import.meta.env.PUBLIC_PLATFORM_DISCORD_URL,
            clientId: envVariables.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID || import.meta.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID,
            clientSecret: envVariables.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET || import.meta.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET,
        },
        PUBLIC_ALLOW_DOMAIN: envVariables.PUBLIC_ALLOW_DOMAIN || import.meta.env.PUBLIC_ALLOW_DOMAIN,
        MODE: envVariables.PUBLIC_MODE || import.meta.env.PUBLIC_MODE,
        PUBLIC_REDIRECT_FROM_URL: envVariables.PUBLIC_REDIRECT_FROM_URL || import.meta.env.PUBLIC_REDIRECT_FROM_URL,
        PUBLIC_REDIRECTION_TARGET_URL: envVariables.PUBLIC_REDIRECTION_TARGET_URL || import.meta.env.PUBLIC_REDIRECTION_TARGET_URL,
    };
})();
