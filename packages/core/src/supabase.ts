import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseEnv {
  url?: string
  anonKey?: string
}

export function createSupabaseBrowserClient(env: SupabaseEnv): SupabaseClient | null {
  if (!env.url || !env.anonKey) {
    return null
  }

  const canPersistSession = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: canPersistSession,
      autoRefreshToken: true
    }
  })
}
