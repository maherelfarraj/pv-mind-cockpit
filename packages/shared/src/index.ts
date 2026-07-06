// ============================================================
// Domain Types
// ============================================================
export interface Project {
  id: string;
  name: string;
  type: 'pv' | 'pv-bess';
  location: { lat: number; lon: number; timezone: string };
  capacity_kwp: number;
  bess_capacity_kwh?: number;
  status: 'draft' | 'active' | 'exported';
  created_at: string;
  updated_at: string;
}

export interface PVModule {
  id: string;
  manufacturer: string;
  model: string;
  power_wp: number;
  voc: number;
  isc: number;
  vmp: number;
  imp: number;
  temp_coeff_pmax: number;
  efficiency: number;
  dimensions: { length: number; width: number; height: number };
  weight: number;
}

export interface Inverter {
  id: string;
  manufacturer: string;
  model: string;
  rated_power_kw: number;
  max_dc_power_kw: number;
  mppt_count: number;
  mppt_voltage_min: number;
  mppt_voltage_max: number;
  max_input_current_per_mppt: number;
  efficiency_euro: number;
  efficiency_cec: number;
}

export interface BESSUnit {
  id: string;
  manufacturer: string;
  model: string;
  capacity_kwh: number;
  power_kw: number;
  voltage_v: number;
  dod: number;
  round_trip_efficiency: number;
  chemistry: 'LFP' | 'NMC' | 'NCA';
}

export interface StringConfig {
  mppt_id: number;
  strings: number;
  modules_per_string: number;
  module_id: string;
  inverter_id: string;
  tilt: number;
  azimuth: number;
}

export interface BOMLine {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unit_cost_usd: number;
  total_cost_usd: number;
}

export interface YieldResult {
  annual_energy_kwh: number;
  specific_yield_kwh_kwp: number;
  performance_ratio: number;
  capacity_factor: number;
  monthly_energy_kwh: number[];
}

export interface CAPEXResult {
  total_usd: number;
  per_kwp_usd: number;
  breakdown: { category: string; amount_usd: number }[];
}

export interface SimulationResult {
  p50_kwh: number;
  p90_kwh: number;
  losses: LossBreakdown;
  monthly_irradiance: number[];
  monthly_energy_kwh: number[];
  hourly_power_kw: number[];
}

export interface LossBreakdown {
  soiling: number;
  shading: number;
  reflection: number;
  irradiance: number;
  temperature: number;
  mismatch: number;
  wiring: number;
  inverter: number;
  transformer: number;
  availability: number;
  total: number;
}

export interface SCADAPoint {
  timestamp: string;
  power_kw: number;
  energy_kwh: number;
  irradiance_wm2: number;
  temperature_c: number;
  pr: number;
  status: 'online' | 'offline' | 'alarm';
}

export interface Alarm {
  id: string;
  project_id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  triggered_at: string;
  resolved_at?: string;
  status: 'active' | 'resolved';
}

export interface WorkOrder {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'closed';
  assigned_to?: string;
  created_at: string;
  due_date: string;
}

export interface Anomaly {
  id: string;
  project_id: string;
  type: string;
  description: string;
  rca: string;
  confidence: number;
  detected_at: string;
}

// ============================================================
// Calculation Utilities
// ============================================================

export function calcYield(
  capacity_kwp: number,
  irradiance_kwh_m2: number,
  performance_ratio: number
): YieldResult {
  const safeCapacity = capacity_kwp > 0 ? capacity_kwp : 1;
  const annual_energy_kwh = safeCapacity * irradiance_kwh_m2 * performance_ratio;
  const specific_yield_kwh_kwp = annual_energy_kwh / safeCapacity;
  const capacity_factor = annual_energy_kwh / (safeCapacity * 8760);
  const monthly_fractions = [0.055, 0.065, 0.09, 0.1, 0.11, 0.105, 0.11, 0.105, 0.09, 0.075, 0.055, 0.04];
  const monthly_energy_kwh = monthly_fractions.map(f => +(annual_energy_kwh * f).toFixed(0));
  return {
    annual_energy_kwh: +annual_energy_kwh.toFixed(0),
    specific_yield_kwh_kwp: +specific_yield_kwh_kwp.toFixed(1),
    performance_ratio,
    capacity_factor: +capacity_factor.toFixed(3),
    monthly_energy_kwh,
  };
}

export function calcCAPEX(capacity_kwp: number, bess_kwh = 0): CAPEXResult {
  const safeCapacity = capacity_kwp > 0 ? capacity_kwp : 1;
  const modules = safeCapacity * 250;
  const inverters = safeCapacity * 60;
  const mounting = safeCapacity * 80;
  const electrical = safeCapacity * 50;
  const bop = safeCapacity * 40;
  const bess_cost = bess_kwh * 200;
  const installation = safeCapacity * 70;
  const engineering = safeCapacity * 30;
  const total_usd = modules + inverters + mounting + electrical + bop + bess_cost + installation + engineering;
  return {
    total_usd: +total_usd.toFixed(0),
    per_kwp_usd: +(total_usd / safeCapacity).toFixed(0),
    breakdown: [
      { category: 'PV Modules', amount_usd: +modules.toFixed(0) },
      { category: 'Inverters', amount_usd: +inverters.toFixed(0) },
      { category: 'Mounting Structure', amount_usd: +mounting.toFixed(0) },
      { category: 'Electrical BOS', amount_usd: +electrical.toFixed(0) },
      { category: 'Balance of Plant', amount_usd: +bop.toFixed(0) },
      ...(bess_kwh > 0 ? [{ category: 'BESS', amount_usd: +bess_cost.toFixed(0) }] : []),
      { category: 'Installation', amount_usd: +installation.toFixed(0) },
      { category: 'Engineering', amount_usd: +engineering.toFixed(0) },
    ],
  };
}

export function calcBOM(capacity_kwp: number, module_wp = 550, bess_kwh = 0): BOMLine[] {
  const safeCapacity = capacity_kwp > 0 ? capacity_kwp : 1;
  const n_modules = Math.ceil((safeCapacity * 1000) / module_wp);
  const n_inverters = Math.ceil(safeCapacity / 110);
  const lines: BOMLine[] = [
    { category: 'PV', description: `PV Module ${module_wp}Wp`, quantity: n_modules, unit: 'pcs', unit_cost_usd: +(module_wp * 0.25).toFixed(2), total_cost_usd: +(n_modules * module_wp * 0.25).toFixed(2) },
    { category: 'Inverter', description: 'String Inverter 110kW', quantity: n_inverters, unit: 'pcs', unit_cost_usd: 6600, total_cost_usd: n_inverters * 6600 },
    { category: 'Mounting', description: 'Fixed tilt mounting structure', quantity: safeCapacity, unit: 'kWp', unit_cost_usd: 80, total_cost_usd: safeCapacity * 80 },
    { category: 'Cable', description: 'DC Cable 4mm²', quantity: Math.ceil(safeCapacity * 2.5), unit: 'm', unit_cost_usd: 1.2, total_cost_usd: +(Math.ceil(safeCapacity * 2.5) * 1.2).toFixed(2) },
    { category: 'Cable', description: 'AC Cable 35mm²', quantity: Math.ceil(safeCapacity * 0.8), unit: 'm', unit_cost_usd: 4.5, total_cost_usd: +(Math.ceil(safeCapacity * 0.8) * 4.5).toFixed(2) },
    { category: 'Protection', description: 'DC String Combiner Box', quantity: Math.ceil(n_modules / 24), unit: 'pcs', unit_cost_usd: 350, total_cost_usd: Math.ceil(n_modules / 24) * 350 },
    { category: 'Protection', description: 'AC Switchboard', quantity: n_inverters, unit: 'pcs', unit_cost_usd: 800, total_cost_usd: n_inverters * 800 },
    { category: 'Monitoring', description: 'SCADA Data Logger', quantity: 1, unit: 'pcs', unit_cost_usd: 1200, total_cost_usd: 1200 },
    ...(bess_kwh > 0 ? [{ category: 'BESS', description: 'LFP Battery Cabinet 100kWh', quantity: Math.ceil(bess_kwh / 100), unit: 'pcs', unit_cost_usd: 20000, total_cost_usd: Math.ceil(bess_kwh / 100) * 20000 }] : []),
  ];
  return lines;
}

export function validateStringing(
  module: Pick<PVModule, 'voc' | 'vmp' | 'imp' | 'isc'>,
  inverter: Pick<Inverter, 'mppt_voltage_min' | 'mppt_voltage_max' | 'max_input_current_per_mppt'>,
  modules_per_string: number,
  strings_per_mppt: number,
  temp_min_c = -10
): { valid: boolean; warnings: string[]; errors: string[]; voc_string: number; vmp_string: number; isc_total: number } {
  const warnings: string[] = [];
  const errors: string[] = [];
  const voc_string = module.voc * modules_per_string * (1 + (temp_min_c - 25) * -0.0028);
  const vmp_string = module.vmp * modules_per_string;
  const isc_total = module.isc * strings_per_mppt;
  if (voc_string > inverter.mppt_voltage_max) errors.push(`Voc (${voc_string.toFixed(1)}V) exceeds inverter max voltage (${inverter.mppt_voltage_max}V)`);
  if (vmp_string < inverter.mppt_voltage_min) warnings.push(`Vmp (${vmp_string.toFixed(1)}V) below MPPT min (${inverter.mppt_voltage_min}V)`);
  if (vmp_string > inverter.mppt_voltage_max) errors.push(`Vmp (${vmp_string.toFixed(1)}V) exceeds MPPT max (${inverter.mppt_voltage_max}V)`);
  if (isc_total > inverter.max_input_current_per_mppt) warnings.push(`Isc total (${isc_total.toFixed(1)}A) exceeds MPPT max current (${inverter.max_input_current_per_mppt}A)`);
  return { valid: errors.length === 0, warnings, errors, voc_string, vmp_string, isc_total };
}

export function calcSimulation(capacity_kwp: number, lat: number, _bess_kwh = 0): SimulationResult {
  const safeCapacity = capacity_kwp > 0 ? capacity_kwp : 1;
  const irradiance = 1700 - Math.abs(lat) * 15;
  const base_yield = calcYield(safeCapacity, irradiance, 0.82);
  const losses: LossBreakdown = {
    soiling: 2.0, shading: 1.5, reflection: 2.5, irradiance: 1.0,
    temperature: 3.5, mismatch: 0.5, wiring: 1.5, inverter: 2.0,
    transformer: 0.5, availability: 1.0, total: 16.0,
  };
  const p50 = base_yield.annual_energy_kwh;
  const p90 = +(p50 * 0.92).toFixed(0);
  const hourly_power_kw: number[] = Array.from({ length: 8760 }, (_, i) => {
    const hour = i % 24;
    if (hour < 6 || hour > 19) return 0;
    const solar_factor = Math.sin((Math.PI * (hour - 6)) / 13);
    return +(safeCapacity * solar_factor * 0.85 * (0.9 + Math.random() * 0.2)).toFixed(2);
  });
  return {
    p50_kwh: p50,
    p90_kwh: p90,
    losses,
    monthly_irradiance: base_yield.monthly_energy_kwh.map(e => +(e / safeCapacity / 0.82).toFixed(1)),
    monthly_energy_kwh: base_yield.monthly_energy_kwh,
    hourly_power_kw,
  };
}

export function generateSCADAPoints(capacity_kwp: number, count = 24): SCADAPoint[] {
  const safeCapacity = capacity_kwp > 0 ? capacity_kwp : 1;
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(now.getTime() - (count - 1 - i) * 3600000);
    const hour = t.getHours();
    const solar = hour >= 6 && hour <= 18 ? Math.sin((Math.PI * (hour - 6)) / 12) : 0;
    const power_kw = +(safeCapacity * solar * 0.85).toFixed(1);
    const irradiance = +(1000 * solar * (0.95 + Math.random() * 0.1)).toFixed(0);
    const pr = solar > 0 ? +((power_kw / (safeCapacity * irradiance / 1000 + 0.001)) * 100).toFixed(1) : 0;
    return {
      timestamp: t.toISOString(),
      power_kw,
      energy_kwh: +(power_kw * 0.85).toFixed(1),
      irradiance_wm2: irradiance,
      temperature_c: +(20 + solar * 15).toFixed(1),
      pr,
      status: power_kw > 0 ? 'online' : 'offline',
    } as SCADAPoint;
  });
}

export function calcFleetKPIs(projects: Project[]): { total_kwp: number; active: number; avg_pr: number; health_score: number } {
  const total_kwp = projects.reduce((s, p) => s + p.capacity_kwp, 0);
  const active = projects.filter(p => p.status === 'active').length;
  return { total_kwp, active, avg_pr: 82.3, health_score: 94 };
}
