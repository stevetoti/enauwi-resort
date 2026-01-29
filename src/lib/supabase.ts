import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// For general usage (API routes, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client components with SSR support
export const createClientSupabase = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)
