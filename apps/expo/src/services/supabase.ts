import { initSupabase, getSupabaseClient } from '@pvmind/supabase';
import { Env, isConfigured } from '../config/env';

let initialized = false;

export function ensureSupabase() {
  if (initialized) return getSupabaseClient();
  if (!isConfigured()) {
    console.warn(
      '[pvmind] Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
    return null;
  }
  const client = initSupabase({
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  });
  initialized = true;
  return client;
}
