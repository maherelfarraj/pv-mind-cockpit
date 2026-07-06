// ─── Project & Location ──────────────────────────────────────────────────────

export type ProjectType = 'pv' | 'pv-bess' | 'bess-only'
export type ProjectStatus = 'draft' | 'active' | 'construction' | 'commissioned' | 'archived'

export interface GeoLocation {
  lat: number
  lon: number
  /** IANA timezone name, e.g. "Asia/Dubai" */
  timezone: string
  elevation_m?: number
}

export interface Project {
  id: string
  name: string
  client?: string
  type: ProjectType
  status: ProjectStatus
  location: GeoLocation
  /** DC capacity in kWp */
  capacity_kwp: number
  /** AC capacity in kW */
  capacity_kw_ac?: number
  bess_capacity_kwh?: number
  bess_power_kw?: number
  created_at: string
  updated_at: string
}

// ─── PV Module ───────────────────────────────────────────────────────────────

export interface PVModule {
  id: string
  manufacturer: string
  model: string
  /** STC power in Wp */
  power_wp: number
  /** Open-circuit voltage (V) */
  voc: number
  /** Short-circuit current (A) */
  isc: number
  /** Maximum power point voltage (V) */
  vmp: number
  /** Maximum power point current (A) */
  imp: number
  /** Temperature coefficient for Pmax (%/°C) */
  temp_coeff_pmax: number
  /** Module efficiency (%) */
  efficiency: number
  dimensions: { length: number; width: number; height: number }
  weight: number
}

// ─── Inverter ────────────────────────────────────────────────────────────────

export interface Inverter {
  id: string
  manufacturer: string
  model: string
  rated_power_kw: number
  max_dc_power_kw: number
  mppt_count: number
  mppt_voltage_min: number
  mppt_voltage_max: number
  max_input_current_per_mppt: number
  efficiency_euro: number
  efficiency_cec: number
}

// ─── BESS ────────────────────────────────────────────────────────────────────

export type BESSChemistry = 'LFP' | 'NMC' | 'NCA' | 'LTO'

export interface BESSUnit {
  id: string
  manufacturer: string
  model: string
  /** Nominal capacity in kWh */
  capacity_kwh: number
  /** Rated power in kW */
  power_kw: number
  voltage_v: number
  /** Depth of discharge (%) */
  dod: number
  /** Round-trip efficiency (%) */
  round_trip_efficiency: number
  chemistry: BESSChemistry
}

// ─── Alarm ───────────────────────────────────────────────────────────────────

export type AlarmSeverity = 'critical' | 'warning' | 'info'
export type AlarmStatus = 'active' | 'acknowledged' | 'resolved'

export interface Alarm {
  id: string
  project_id: string
  severity: AlarmSeverity
  message: string
  triggered_at: string
  status: AlarmStatus
  acknowledged_at?: string
  resolved_at?: string
}

// ─── Work Order ──────────────────────────────────────────────────────────────

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical'
export type WorkOrderStatus = 'open' | 'in_progress' | 'on_hold' | 'closed'

export interface WorkOrder {
  id: string
  project_id: string
  title: string
  description: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  assigned_to?: string
  created_at: string
  due_date?: string
  closed_at?: string
}

// ─── Anomaly ─────────────────────────────────────────────────────────────────

export interface Anomaly {
  id: string
  project_id: string
  type: string
  description: string
  rca: string
  /** ML confidence 0-100 */
  confidence: number
  detected_at: string
  dismissed_at?: string
}

// ─── SCADA ───────────────────────────────────────────────────────────────────

export interface SCADAPoint {
  timestamp: string
  power_kw: number
  energy_kwh: number
  irradiance_wm2: number
  temperature_c: number
  pr: number
  status: 'online' | 'degraded' | 'offline'
}

// ─── Yield ───────────────────────────────────────────────────────────────────

export interface YieldResult {
  annual_energy_kwh: number
  monthly_energy_kwh: number[]
  specific_yield_kwh_kwp: number
  pr_annual: number
  p50_kwh: number
  p90_kwh: number
  co2_avoided_tonnes: number
}

// ─── CAPEX ───────────────────────────────────────────────────────────────────

export interface CAPEXBreakdown {
  pv_modules_usd: number
  inverters_usd: number
  mounting_usd: number
  bos_usd: number
  bess_usd: number
  epc_usd: number
  grid_connection_usd: number
  total_usd: number
  usd_per_watt: number
}

// ─── SLD ─────────────────────────────────────────────────────────────────────

export interface SLDComponent {
  id: string
  type: 'string' | 'combiner' | 'inverter' | 'transformer' | 'grid'
  label: string
  rating?: string
  connections: string[]
}

export interface SLDData {
  project_id: string
  components: SLDComponent[]
  generated_at: string
}
