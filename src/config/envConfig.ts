
export const envConfig = {
    PUBLIC_BASE_URL: globalThis.baseUrl || import.meta.env.PUBLIC_BASE_URL,
    PUBLIC_CRYPTO_PRIVATE_KEY: globalThis.encryptKey || import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY,
    PUBLIC_SUPABASE_URL: globalThis.supabaseUrl || import.meta.env.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_KEY: globalThis.supabaseKey || import.meta.env.PUBLIC_SUPABASE_KEY,
    PUBLIC_SUPABASE_JWT_SECRET: globalThis.supabaseSecret || import.meta.env.PUBLIC_SUPABASE_JWT_SECRET

}