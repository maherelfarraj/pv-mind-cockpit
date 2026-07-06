import { getSupabaseClient } from '../client';
import type { Database } from '../types/database';

type Simulation = Database['public']['Tables']['simulations']['Row'];
type SimulationInsert = Database['public']['Tables']['simulations']['Insert'];

export async function listSimulations(projectId: string): Promise<Simulation[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSimulation(id: string): Promise<Simulation | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createSimulation(input: SimulationInsert): Promise<Simulation> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('simulations')
    .insert({ ...input, status: 'pending' })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create simulation');
  return data;
}

export async function updateSimulationStatus(
  id: string,
  status: Database['public']['Enums']['simulation_status'],
  results?: Partial<Pick<Simulation, 'annual_ac_mwh' | 'specific_yield_kwh_kwp' | 'capacity_factor' | 'performance_ratio' | 'co2_avoided_tonnes' | 'lcoe_usd_kwh' | 'error_message' | 'completed_at'>>,
): Promise<Simulation> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('simulations')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(results ?? {}),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Simulation not found');
  return data;
}
