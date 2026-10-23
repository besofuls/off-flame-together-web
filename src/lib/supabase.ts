import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR-PROJECT'))

// Only the public anon key is ever used in the browser. Access is limited by RLS.
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, { auth: { persistSession: false } })
  : null
