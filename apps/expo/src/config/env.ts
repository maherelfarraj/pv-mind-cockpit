/**
 * Application environment configuration.
 * All values come from EXPO_PUBLIC_* environment variables.
 * Never hardcode production URLs or keys.
 */

export const Env = {
  supabaseUrl: process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? '',
  supabaseAnonKey: process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
  appEnv: (process.env['EXPO_PUBLIC_APP_ENV'] ?? 'development') as 'production' | 'staging' | 'development',
  appVersion: process.env['EXPO_PUBLIC_APP_VERSION'] ?? '0.1.0',
  domain: process.env['EXPO_PUBLIC_DOMAIN'] ?? 'pvmind.ai',
} as const;

export function isConfigured(): boolean {
  return Boolean(Env.supabaseUrl && Env.supabaseAnonKey);
}

export function isProduction(): boolean {
  return Env.appEnv === 'production';
}
