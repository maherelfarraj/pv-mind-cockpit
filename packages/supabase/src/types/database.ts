/** Full TypeScript types for the PV Mind Supabase database schema */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';
export type SimulationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          organization: string | null;
          role: 'admin' | 'engineer' | 'viewer';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          location_name: string | null;
          latitude: number | null;
          longitude: number | null;
          status: ProjectStatus;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      pv_designs: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          daily_load_kwh: number | null;
          peak_sun_hours: number | null;
          system_efficiency: number | null;
          module_power_wp: number | null;
          module_area_m2: number | null;
          modules_per_string: number | null;
          strings_count: number | null;
          array_kwp: number | null;
          inverter_capacity_kw: number | null;
          annual_production_mwh: number | null;
          performance_ratio: number | null;
          tilt_deg: number | null;
          azimuth_deg: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pv_designs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pv_designs']['Insert']>;
      };
      bess_designs: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          required_energy_kwh: number | null;
          dod: number | null;
          round_trip_efficiency: number | null;
          backup_hours: number | null;
          gross_capacity_kwh: number | null;
          peak_power_kw: number | null;
          nominal_voltage_v: number | null;
          nominal_capacity_ah: number | null;
          series_count: number | null;
          parallel_count: number | null;
          chemistry: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bess_designs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bess_designs']['Insert']>;
      };
      simulations: {
        Row: {
          id: string;
          project_id: string;
          pv_design_id: string | null;
          bess_design_id: string | null;
          name: string;
          status: SimulationStatus;
          annual_ac_mwh: number | null;
          specific_yield_kwh_kwp: number | null;
          capacity_factor: number | null;
          performance_ratio: number | null;
          co2_avoided_tonnes: number | null;
          lcoe_usd_kwh: number | null;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['simulations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['simulations']['Insert']>;
      };
      scada_readings: {
        Row: {
          id: string;
          project_id: string;
          device_id: string;
          timestamp: string;
          ac_power_kw: number | null;
          dc_power_kw: number | null;
          energy_today_kwh: number | null;
          energy_total_mwh: number | null;
          irradiance_w_m2: number | null;
          module_temp_c: number | null;
          ambient_temp_c: number | null;
          frequency_hz: number | null;
          voltage_v: number | null;
          current_a: number | null;
          pr: number | null;
          status: string | null;
          alarms: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['scada_readings']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['scada_readings']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: ProjectStatus;
      simulation_status: SimulationStatus;
    };
  };
}
