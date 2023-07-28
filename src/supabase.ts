// import type { Database } from './types'
import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseUrl = 'https://ukunrrjsbgfbtbtjrmes.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdW5ycmpzYmdmYnRidGpybWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM0NjMyNzMsImV4cCI6MTk5OTAzOTI3M30.fogmQblrGAoiPDxhsV9dZtJ0A8B20hwL4oqXc2MPsRQ'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)