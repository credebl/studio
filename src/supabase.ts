// import type { Database } from './types'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)