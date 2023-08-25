/// <reference types="astro/client" />

// https://docs.astro.build/en/guides/environment-variables/#intellisense-for-typescript
interface ImportMetaEnv {
	readonly SITE: string;
	readonly PUBLIC_BASE_URL:string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	var baseUrl: string;
	var encryptKey: string;
	var supaUrl: string;
	var supaKey: string;
	var supaSecret: string;
}

export { };