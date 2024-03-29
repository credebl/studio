let envVariables = {
	// ...globalThis,
	fromENV1: "global-This"
} || {}

try {
	if (import.meta.env) {
		envVariables = {
			...envVariables,
			...import.meta.env,
			"fromENV3": "import-meta-env"
		}
	}

	console.log(343409, import.meta.env);

	if (process?.env) {
		envVariables = {
			...envVariables,
			...process?.env,
			"fromENV2": "PROCESS-ENV"
		}
	}

	console.log(3434091, process?.env);
	

} catch (error) {

}


const { PUBLIC_BASE_URL, PUBLIC_CRYPTO_PRIVATE_KEY, PUBLIC_SHOW_NAME_AS_LOGO, PUBLIC_PLATFORM_NAME, PUBLIC_PLATFORM_LOGO, PUBLIC_POWERED_BY, PUBLIC_PLATFORM_WEB_URL, PUBLIC_POWERED_BY_URL, PUBLIC_PLATFORM_DOCS_URL, PUBLIC_PLATFORM_GIT, PUBLIC_PLATFORM_SUPPORT_EMAIL, PUBLIC_PLATFORM_TWITTER_URL, PUBLIC_PLATFORM_SUPPORT_INVITE, PUBLIC_PLATFORM_DISCORD_URL }: any = envVariables;

console.log(324234234243, envVariables);

export const envConfig = {
	PUBLIC_BASE_URL,
	PUBLIC_CRYPTO_PRIVATE_KEY,
	PLATFORM_DATA: {
		nameAsLogo: PUBLIC_SHOW_NAME_AS_LOGO,
		name: PUBLIC_PLATFORM_NAME,
		logo: PUBLIC_PLATFORM_LOGO,
		poweredBy: PUBLIC_POWERED_BY,
		webUrl: PUBLIC_PLATFORM_WEB_URL,
		orgUrl: PUBLIC_POWERED_BY_URL,
		docs: PUBLIC_PLATFORM_DOCS_URL,
		git: PUBLIC_PLATFORM_GIT,
		support: PUBLIC_PLATFORM_SUPPORT_EMAIL,
		twitter: PUBLIC_PLATFORM_TWITTER_URL,
		discord: PUBLIC_PLATFORM_DISCORD_URL,
	}
}