// ─── Safe Math ───────────────────────────────────────────────────────────────
// All calculations return null instead of NaN/Infinity when inputs are invalid.
// UI renders null as "Needs Input" (amber italic), never as NaN or Infinity.

/** Returns null if v is not a finite non-NaN number; otherwise returns v. */
export function safeNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Divides numerator by denominator; returns null if denominator is 0. */
export function safeDivide(num: number | null, den: number | null): number | null {
  const n = safeNumber(num)
  const d = safeNumber(den)
  if (n === null || d === null || d === 0) return null
  return n / d
}

// ─── PV Sizing ───────────────────────────────────────────────────────────────

export interface PVSizingInput {
  /** Daily energy demand in kWh */
  daily_energy_kwh?: number | null
  /** Peak sun hours per day */
  peak_sun_hours?: number | null
  /** Performance ratio 0-1 */
  performance_ratio?: number | null
  /** System losses factor 0-1 (default 0.14) */
  system_losses?: number | null
}

export interface PVSizingResult {
  /** Required DC capacity in kWp */
  required_kwp: number | null
  /** Required AC capacity in kW */
  required_kw_ac: number | null
  /** DC/AC ratio */
  dc_ac_ratio: number | null
  /** Estimated number of 500Wp modules */
  module_count_500wp: number | null
}

export function sizePVSystem(input: PVSizingInput): PVSizingResult {
  const energy = safeNumber(input.daily_energy_kwh)
  const psh = safeNumber(input.peak_sun_hours)
  const pr = safeNumber(input.performance_ratio) ?? 0.80
  const losses = safeNumber(input.system_losses) ?? 0.14
  const eff = (1 - losses) * pr

  if (psh === 0) {
    return { required_kwp: null, required_kw_ac: null, dc_ac_ratio: null, module_count_500wp: null }
  }

  const required_kwp = safeDivide(energy, psh === null ? null : psh * eff)
  const required_kw_ac = required_kwp === null ? null : +(required_kwp * 0.9).toFixed(2)
  const dc_ac_ratio = required_kwp === null || required_kw_ac === null ? null : safeDivide(required_kwp, required_kw_ac)
  const module_count_500wp = required_kwp === null ? null : Math.ceil((required_kwp * 1000) / 500)

  return {
    required_kwp: required_kwp === null ? null : +required_kwp.toFixed(2),
    required_kw_ac,
    dc_ac_ratio: dc_ac_ratio === null ? null : +dc_ac_ratio.toFixed(3),
    module_count_500wp,
  }
}

// ─── BESS Sizing ─────────────────────────────────────────────────────────────

export interface BESSSizingInput {
  /** Daily self-consumption energy in kWh */
  daily_energy_kwh?: number | null
  /** Desired autonomy in hours */
  autonomy_hours?: number | null
  /** Depth of discharge 0-1 */
  dod?: number | null
  /** Round-trip efficiency 0-1 */
  rte?: number | null
  /** Average load power in kW */
  load_kw?: number | null
}

export interface BESSSizingResult {
  nominal_capacity_kwh: number | null
  usable_capacity_kwh: number | null
  required_power_kw: number | null
  energy_to_power_ratio: number | null
}

export function sizeBESSSystem(input: BESSSizingInput): BESSSizingResult {
  const energy = safeNumber(input.daily_energy_kwh)
  const autonomy = safeNumber(input.autonomy_hours)
  const dod = safeNumber(input.dod) ?? 0.90
  const rte = safeNumber(input.rte) ?? 0.92
  const load = safeNumber(input.load_kw)

  const usable_capacity_kwh = energy === null || autonomy === null
    ? null
    : safeNumber((energy * (autonomy / 24)) / rte)

  const nominal_capacity_kwh = usable_capacity_kwh === null
    ? null
    : safeDivide(usable_capacity_kwh, dod)

  const required_power_kw = load

  const energy_to_power_ratio = usable_capacity_kwh === null || required_power_kw === null
    ? null
    : safeDivide(usable_capacity_kwh, required_power_kw)

  return {
    nominal_capacity_kwh: nominal_capacity_kwh === null ? null : +nominal_capacity_kwh.toFixed(2),
    usable_capacity_kwh: usable_capacity_kwh === null ? null : +usable_capacity_kwh.toFixed(2),
    required_power_kw,
    energy_to_power_ratio: energy_to_power_ratio === null ? null : +energy_to_power_ratio.toFixed(2),
  }
}

// ─── Annual Yield ─────────────────────────────────────────────────────────────

export interface YieldInput {
  /** DC system capacity in kWp */
  capacity_kwp?: number | null
  /** Annual global horizontal irradiance in kWh/m² */
  annual_ghi_kwh_m2?: number | null
  /** Performance ratio 0-1 */
  performance_ratio?: number | null
  /** Module tilt in degrees */
  tilt_deg?: number | null
  /** Azimuth in degrees (180 = south) */
  azimuth_deg?: number | null
}

export interface YieldResult {
  annual_energy_kwh: number | null
  specific_yield_kwh_kwp: number | null
  monthly_energy_kwh: (number | null)[]
  p50_kwh: number | null
  p90_kwh: number | null
  co2_avoided_tonnes: number | null
}

const MONTHLY_DISTRIBUTION = [0.064, 0.069, 0.083, 0.088, 0.094, 0.098, 0.100, 0.095, 0.088, 0.080, 0.068, 0.073]
const CO2_GRID_KG_PER_KWH = 0.45

export function calcAnnualYield(input: YieldInput): YieldResult {
  const kwp = safeNumber(input.capacity_kwp)
  const ghi = safeNumber(input.annual_ghi_kwh_m2)
  const pr = safeNumber(input.performance_ratio) ?? 0.80
  const tilt = safeNumber(input.tilt_deg) ?? 20
  // Simple tilt correction factor (approximation)
  const tilt_factor = 1 + 0.0003 * tilt - 0.000005 * tilt * tilt

  const annual_energy_kwh = kwp === null || ghi === null
    ? null
    : +(kwp * ghi * pr * tilt_factor).toFixed(0)

  const specific_yield_kwh_kwp = annual_energy_kwh === null || kwp === null
    ? null
    : safeDivide(annual_energy_kwh, kwp)

  const monthly_energy_kwh = annual_energy_kwh === null
    ? MONTHLY_DISTRIBUTION.map(() => null)
    : MONTHLY_DISTRIBUTION.map(f => +(annual_energy_kwh * f).toFixed(0))

  const p50_kwh = annual_energy_kwh
  const p90_kwh = annual_energy_kwh === null ? null : +(annual_energy_kwh * 0.92).toFixed(0)
  const co2_avoided_tonnes = annual_energy_kwh === null
    ? null
    : +((annual_energy_kwh * CO2_GRID_KG_PER_KWH) / 1000).toFixed(1)

  return { annual_energy_kwh, specific_yield_kwh_kwp, monthly_energy_kwh, p50_kwh, p90_kwh, co2_avoided_tonnes }
}

// ─── CAPEX ────────────────────────────────────────────────────────────────────

export interface CAPEXInput {
  capacity_kwp?: number | null
  bess_capacity_kwh?: number | null
  /** Unit cost overrides (USD/Wp for PV components, USD/kWh for BESS) */
  unit_costs?: {
    pv_module_usd_wp?: number
    inverter_usd_wp?: number
    mounting_usd_wp?: number
    bos_usd_wp?: number
    bess_usd_kwh?: number
    epc_margin_pct?: number
    grid_connection_usd_kw?: number
  }
}

export interface CAPEXResult {
  pv_modules_usd: number | null
  inverters_usd: number | null
  mounting_usd: number | null
  bos_usd: number | null
  bess_usd: number | null
  epc_usd: number | null
  grid_connection_usd: number | null
  total_usd: number | null
  usd_per_watt: number | null
}

export function calcCAPEX(input: CAPEXInput): CAPEXResult {
  const kwp = safeNumber(input.capacity_kwp)
  const wp = kwp === null ? null : kwp * 1000
  const bess_kwh = safeNumber(input.bess_capacity_kwh)
  const uc = input.unit_costs ?? {}

  const pv_module_usd_wp = uc.pv_module_usd_wp ?? 0.22
  const inverter_usd_wp = uc.inverter_usd_wp ?? 0.07
  const mounting_usd_wp = uc.mounting_usd_wp ?? 0.12
  const bos_usd_wp = uc.bos_usd_wp ?? 0.15
  const bess_usd_kwh = uc.bess_usd_kwh ?? 220
  const epc_margin_pct = uc.epc_margin_pct ?? 15
  const grid_connection_usd_kw = uc.grid_connection_usd_kw ?? 30

  const pv_modules_usd = wp === null ? null : +(wp * pv_module_usd_wp).toFixed(0)
  const inverters_usd = wp === null ? null : +(wp * inverter_usd_wp).toFixed(0)
  const mounting_usd = wp === null ? null : +(wp * mounting_usd_wp).toFixed(0)
  const bos_usd = wp === null ? null : +(wp * bos_usd_wp).toFixed(0)
  const bess_usd = bess_kwh === null ? 0 : +(bess_kwh * bess_usd_kwh).toFixed(0)

  const subtotal = pv_modules_usd === null ? null
    : pv_modules_usd + (inverters_usd ?? 0) + (mounting_usd ?? 0) + (bos_usd ?? 0) + bess_usd

  const epc_usd = subtotal === null ? null : +((subtotal * epc_margin_pct) / 100).toFixed(0)
  const grid_connection_usd = kwp === null ? null : +((kwp * 0.9 * grid_connection_usd_kw)).toFixed(0)
  const total_usd = subtotal === null ? null
    : subtotal + (epc_usd ?? 0) + (grid_connection_usd ?? 0)

  const usd_per_watt = total_usd === null || wp === null ? null : safeDivide(total_usd, wp)

  return {
    pv_modules_usd, inverters_usd, mounting_usd, bos_usd,
    bess_usd, epc_usd, grid_connection_usd, total_usd,
    usd_per_watt: usd_per_watt === null ? null : +usd_per_watt.toFixed(3),
  }
}

// ─── SCADA Simulation ─────────────────────────────────────────────────────────

export interface SCADAPoint {
  timestamp: string
  power_kw: number
  energy_kwh: number
  irradiance_wm2: number
  temperature_c: number
  pr: number
  status: 'online' | 'degraded' | 'offline'
}

export function generateSCADAPoints(capacity_kwp: number, hours = 24): SCADAPoint[] {
  const now = Date.now()
  return Array.from({ length: hours }, (_, i) => {
    const h = i
    const sunAngle = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI))
    const irr = +(1050 * sunAngle + (Math.random() - 0.5) * 20).toFixed(0)
    const power = +(capacity_kwp * (irr / 1000) * 0.98 + (Math.random() - 0.5) * capacity_kwp * 0.01).toFixed(1)
    const temp = +(25 + irr * 0.03 + (Math.random() - 0.5) * 2).toFixed(1)
    const pr = +(0.80 - (temp - 25) * 0.003 + (Math.random() - 0.5) * 0.01).toFixed(3)
    return {
      timestamp: new Date(now - (hours - 1 - i) * 3_600_000).toISOString(),
      power_kw: Math.max(0, power),
      energy_kwh: Math.max(0, +(power * 1).toFixed(1)),
      irradiance_wm2: Math.max(0, irr),
      temperature_c: temp,
      pr: Math.max(0.5, Math.min(1, pr)),
      status: power > 0 ? 'online' : 'offline',
    }
  })
}

// ─── Fleet KPIs ──────────────────────────────────────────────────────────────

export interface FleetKPIs {
  total_kwp: number
  total_bess_kwh: number
  active: number
  draft: number
  health_score: number
  avg_pr: number
}

export function calcFleetKPIs(projects: { capacity_kwp: number; bess_capacity_kwh?: number; status: string }[]): FleetKPIs {
  const total_kwp = projects.reduce((s, p) => s + p.capacity_kwp, 0)
  const total_bess_kwh = projects.reduce((s, p) => s + (p.bess_capacity_kwh ?? 0), 0)
  const active = projects.filter(p => p.status === 'active').length
  const draft = projects.filter(p => p.status === 'draft').length
  return {
    total_kwp,
    total_bess_kwh,
    active,
    draft,
    health_score: 94,
    avg_pr: 81,
  }
}

// ─── SLD Generator ───────────────────────────────────────────────────────────

export interface SLDInput {
  project_id: string
  capacity_kwp: number
  inverter_count?: number
  has_bess?: boolean
}

export function generateSLDData(input: SLDInput) {
  const inv = input.inverter_count ?? Math.ceil(input.capacity_kwp / 110)
  const components = [
    ...Array.from({ length: inv }, (_, i) => ({
      id: `inv-${i + 1}`,
      type: 'inverter' as const,
      label: `INV-${String(i + 1).padStart(2, '0')} (110 kW)`,
      rating: '110 kW AC',
      connections: [`tr-1`],
    })),
    { id: 'tr-1', type: 'transformer' as const, label: 'HV Transformer', rating: `${inv * 110} kVA / 34.5 kV`, connections: ['grid'] },
    { id: 'grid', type: 'grid' as const, label: 'Grid Connection Point', connections: [] },
    ...(input.has_bess ? [{
      id: 'bess-1', type: 'string' as const, label: 'BESS Container', rating: '500 kWh / 250 kW', connections: ['tr-1'],
    }] : []),
  ]
  return { project_id: input.project_id, components, generated_at: new Date().toISOString() }
}
