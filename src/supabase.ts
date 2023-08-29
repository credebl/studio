import { createClient } from '@supabase/supabase-js'
import { envConfig } from './config/envConfig';

export const getSupabaseClient = () => {

    let supabaseUrl = ''
    let supabaseAnonKey = ''

    try {
        supabaseUrl = process.env.PUBLIC_SUPABASE_URL || envConfig.PUBLIC_SUPABASE_URL;
        supabaseAnonKey = process.env.PUBLIC_SUPABASE_KEY || envConfig.PUBLIC_SUPABASE_KEY;
    } catch (error) {
        supabaseUrl = envConfig.PUBLIC_SUPABASE_URL
        supabaseAnonKey = envConfig.PUBLIC_SUPABASE_KEY
    }

    return createClient(supabaseUrl, supabaseAnonKey)
}