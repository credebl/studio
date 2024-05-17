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

if (import.meta.env) {
	envVariables = {
		...envVariables,
		...import.meta.env
	}
}

const { PUBLIC_BASE_URL, PUBLIC_CRYPTO_PRIVATE_KEY,PUBLIC_SHOW_NAME_AS_LOGO, PUBLIC_PLATFORM_NAME, PUBLIC_PLATFORM_LOGO, PUBLIC_POWERED_BY, PUBLIC_PLATFORM_WEB_URL, PUBLIC_POWERED_BY_URL, PUBLIC_PLATFORM_DOCS_URL, PUBLIC_PLATFORM_GIT, PUBLIC_PLATFORM_SUPPORT_EMAIL, PUBLIC_PLATFORM_TWITTER_URL, PUBLIC_PLATFORM_SUPPORT_INVITE, PUBLIC_PLATFORM_DISCORD_URL, PUBLIC_ALLOW_DOMAIN }: any = envVariables;

export const envConfig = {
	PUBLIC_BASE_URL:
		PUBLIC_BASE_URL || import.meta.env.PUBLIC_BASE_URL,
	PUBLIC_CRYPTO_PRIVATE_KEY:
		PUBLIC_CRYPTO_PRIVATE_KEY ||
		import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY,
	PLATFORM_DATA: {
		nameAsLogo:
		PUBLIC_SHOW_NAME_AS_LOGO || import.meta.env.PUBLIC_SHOW_NAME_AS_LOGO,
		name:
			PUBLIC_PLATFORM_NAME || import.meta.env.PUBLIC_PLATFORM_NAME,
		logo:
			PUBLIC_PLATFORM_LOGO || import.meta.env.PUBLIC_PLATFORM_LOGO,
		poweredBy:
			PUBLIC_POWERED_BY || import.meta.env.PUBLIC_POWERED_BY,
		webUrl:
			PUBLIC_PLATFORM_WEB_URL ||
			import.meta.env.PUBLIC_PLATFORM_WEB_URL,
		orgUrl:
			PUBLIC_POWERED_BY_URL ||
			import.meta.env.PUBLIC_POWERED_BY_URL,
		docs:
			PUBLIC_PLATFORM_DOCS_URL ||
			import.meta.env.PUBLIC_PLATFORM_DOCS_URL,
		git:
			PUBLIC_PLATFORM_GIT ||
			import.meta.env.PUBLIC_PLATFORM_GIT,
		support:
			PUBLIC_PLATFORM_SUPPORT_EMAIL ||
			import.meta.env.PUBLIC_PLATFORM_SUPPORT_EMAIL,
		twitter:
			PUBLIC_PLATFORM_TWITTER_URL ||
			import.meta.env.PUBLIC_PLATFORM_TWITTER_URL,
		discord:
			PUBLIC_PLATFORM_DISCORD_URL ||
			import.meta.env.PUBLIC_PLATFORM_DISCORD_URL,
	},
	PUBLIC_ALLOW_DOMAIN: PUBLIC_ALLOW_DOMAIN || import.meta.env.PUBLIC_ALLOW_DOMAIN
}