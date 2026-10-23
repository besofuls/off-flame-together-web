import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR-PROJECT'))

// Only the public anon key is ever used in the browser.
// Session persistence is enabled so authenticated admins stay signed in across reloads.
// All data access is enforced by PostgreSQL Row Level Security (RLS).
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export type BuildRow = {
  id: string
  version: string
  title: string | null
  release_notes: string | null
  download_url: string | null
  is_published: boolean
  released_at: string | null
  created_at: string
  updated_at: string
}

export type FeedbackRow = {
  id: string
  build_id: string | null
  player_name: string | null
  player_email: string | null
  rating: number
  category: 'general' | 'gameplay' | 'controls' | 'visuals' | 'audio' | 'difficulty' | 'other'
  message: string
  created_at: string
}

export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical'

export type BugReportRow = {
  id: string
  build_id: string | null
  reporter_name: string | null
  reporter_email: string | null
  title: string
  description: string
  steps_to_reproduce: string | null
  system_info: string | null
  severity: BugSeverity
  status: BugStatus
  created_at: string
  updated_at: string
}

export type WindowType = '7d' | '30d' | 'all_time' | 'custom'
export type DataOrigin = 'imported_itch_historical' | 'manual_entry'

export type TrafficReferrerRow = {
  id: string
  snapshot_id: string
  referrer: string
  views: number
  created_at: string
}

export type AnalyticsSnapshotRow = {
  id: string
  source: 'itch.io' | 'landing_page'
  window_type: WindowType
  window_start_date: string
  window_end_date: string
  window_days: number
  captured_on: string
  views: number | null
  unique_views: number | null
  downloads: number | null
  data_origin: DataOrigin
  notes: string | null
  created_at: string
  traffic_referrers?: TrafficReferrerRow[]
}
