import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

let _client: SupabaseClient<Database> | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Returns a singleton Supabase client.
 * Call `initSupabase` once at app startup with your env vars.
 * Never hardcode the URL or key — always read from environment.
 */
export function initSupabase(config: SupabaseConfig): SupabaseClient<Database> {
  if (!config.url || config.url.includes('localhost')) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error(
        '[pvmind/supabase] Supabase URL must be a valid remote URL in production. ' +
          'Set EXPO_PUBLIC_SUPABASE_URL in your environment.',
      );
    }
  }
  if (!config.anonKey) {
    throw new Error(
      '[pvmind/supabase] Supabase anon key is required. ' +
        'Set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.',
    );
  }

  _client = createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
  return _client;
}

/**
 * Returns the initialized Supabase client.
 * Throws if `initSupabase` has not been called.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!_client) {
    throw new Error(
      '[pvmind/supabase] Supabase client is not initialized. Call initSupabase() first.',
    );
  }
  return _client;
}

export type { SupabaseClient };
export type { Database };
