import { createClient } from '@supabase/supabase-js'

export const getSupabaseClient = () => {

    let supabaseUrl = ''
    let supabaseAnonKey = ''

    try {
        supabaseUrl = process.env.PUBLIC_SUPABASE_URL as string;
        supabaseAnonKey = process.env.PUBLIC_SUPABASE_KEY as string;
    } catch (error) {
        supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
        supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY
    }

    return createClient(supabaseUrl, supabaseAnonKey)
}