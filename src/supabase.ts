// import type { Database } from './types'
import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseUrl = 'vsgcvsd chgdsvchgsd'
const supabaseAnonKey = 'dcgjevcjgewvbkbrfybwbgVVJVhgvjcvYVcfcgfCGFCGFc'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)