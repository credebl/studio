import { createClient } from '@supabase/supabase-js'

export const getSupabaseClient = () => {
    
    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.PUBLIC_SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_KEY
    return createClient(supabaseUrl, supabaseAnonKey)
}