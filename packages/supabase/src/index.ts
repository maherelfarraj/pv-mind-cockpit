// PV Mind Supabase Package — Public API
export { initSupabase, getSupabaseClient, type SupabaseConfig } from './client';
export type { Database } from './types/database';

// Repositories
export * from './repositories/projects';
export * from './repositories/simulations';
export * from './repositories/scada';
