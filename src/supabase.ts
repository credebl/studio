// import type { Database } from './types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)