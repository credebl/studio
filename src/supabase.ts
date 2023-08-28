import { createClient } from '@supabase/supabase-js'

export const getSupabaseClient = () => {

    let supabaseUrl = ''
    let supabaseAnonKey = ''

    try {
        supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
        supabaseAnonKey = process.env.PUBLIC_SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_KEY;
    } catch (error) {
        supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
        supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY
    }

    return createClient(supabaseUrl, supabaseAnonKey)
}