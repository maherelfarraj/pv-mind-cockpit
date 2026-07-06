import { getSupabaseClient } from '../client';
import type { Database } from '../types/database';

type ScadaReading = Database['public']['Tables']['scada_readings']['Row'];
type ScadaReadingInsert = Database['public']['Tables']['scada_readings']['Insert'];

export async function getLatestReading(projectId: string, deviceId: string): Promise<ScadaReading | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('scada_readings')
    .select('*')
    .eq('project_id', projectId)
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getReadingsRange(
  projectId: string,
  deviceId: string,
  from: string,
  to: string,
): Promise<ScadaReading[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('scada_readings')
    .select('*')
    .eq('project_id', projectId)
    .eq('device_id', deviceId)
    .gte('timestamp', from)
    .lte('timestamp', to)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function insertReading(input: ScadaReadingInsert): Promise<ScadaReading> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('scada_readings')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to insert SCADA reading');
  return data;
}

/** Subscribe to real-time SCADA updates for a project */
export function subscribeToReadings(
  projectId: string,
  onReading: (reading: ScadaReading) => void,
) {
  const supabase = getSupabaseClient();
  return supabase
    .channel(`scada:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'scada_readings',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => onReading(payload.new as ScadaReading),
    )
    .subscribe();
}
