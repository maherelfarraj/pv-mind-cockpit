export type BaseRecord = {
  id: string;
  company_id: string;
  project_id?: string;
  site_id?: string;
  variant_id?: string;
  subarray_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Company = BaseRecord & {
  name: string;
  code?: string;
  status?: "active" | "inactive";
  metadata?: Record<string, unknown>;
};

export type UserProfile = BaseRecord & {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
};

export type Project = BaseRecord & {
  name: string;
  code?: string;
  description?: string;
  status?: "draft" | "active" | "archived";
  metadata?: Record<string, unknown>;
};

export type ProjectVariant = BaseRecord & {
  name: string;
  version?: string;
  is_default?: boolean;
  assumptions?: Record<string, unknown>;
};

export type ProjectSite = BaseRecord & {
  name: string;
  latitude?: number;
  longitude?: number;
  elevation_m?: number;
  timezone?: string;
  metadata?: Record<string, unknown>;
};

export type WeatherFile = BaseRecord & {
  source: string;
  file_name: string;
  format?: string;
  start_date?: string;
  end_date?: string;
  checksum?: string;
};

export type PVModule = BaseRecord & {
  manufacturer?: string;
  model: string;
  technology?: string;
  pmp_w?: number;
  vmp_v?: number;
  imp_a?: number;
  metadata?: Record<string, unknown>;
};

export type Inverter = BaseRecord & {
  manufacturer?: string;
  model: string;
  type?: "string" | "central" | "micro";
  ac_power_kw?: number;
  max_dc_voltage_v?: number;
  metadata?: Record<string, unknown>;
};

export type BESSConfig = BaseRecord & {
  name: string;
  chemistry?: string;
  energy_kwh?: number;
  power_kw?: number;
  round_trip_efficiency_pct?: number;
  metadata?: Record<string, unknown>;
};

export type StructureConfig = BaseRecord & {
  name: string;
  type?: "fixed_tilt" | "single_axis_tracker" | "dual_axis_tracker";
  tilt_deg?: number;
  azimuth_deg?: number;
  metadata?: Record<string, unknown>;
};

export type StringingConfig = BaseRecord & {
  name: string;
  modules_per_string?: number;
  strings_per_inverter?: number;
  dc_oversize_ratio?: number;
  metadata?: Record<string, unknown>;
};

export type YieldAssumptions = BaseRecord & {
  degradation_pct_per_year?: number;
  availability_pct?: number;
  soiling_loss_pct?: number;
  clipping_loss_pct?: number;
  metadata?: Record<string, unknown>;
};

export type CAPEXAssumptions = BaseRecord & {
  currency?: string;
  module_cost_per_w?: number;
  inverter_cost_per_w?: number;
  structure_cost_per_w?: number;
  bos_cost_per_w?: number;
  metadata?: Record<string, unknown>;
};

export type BOMItem = BaseRecord & {
  category: string;
  item_name: string;
  sku?: string;
  quantity: number;
  unit?: string;
  unit_cost?: number;
  total_cost?: number;
  metadata?: Record<string, unknown>;
};

export type SLDNode = BaseRecord & {
  node_type: string;
  label: string;
  x?: number;
  y?: number;
  data?: Record<string, unknown>;
};

export type SLDEdge = BaseRecord & {
  from_node_id: string;
  to_node_id: string;
  edge_type?: string;
  label?: string;
  data?: Record<string, unknown>;
};

export type SimulationRun = BaseRecord & {
  name?: string;
  engine?: string;
  status: "queued" | "running" | "completed" | "failed";
  started_at?: string;
  finished_at?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
};

export type SimulationLossProfile = BaseRecord & {
  simulation_run_id?: string;
  profile_name: string;
  losses_pct: Record<string, number>;
  notes?: string;
};

export type SCADASite = BaseRecord & {
  name: string;
  external_id?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, unknown>;
};

export type SCADADevice = BaseRecord & {
  scada_site_id: string;
  name: string;
  device_type: string;
  external_id?: string;
  status?: "online" | "offline" | "unknown";
  metadata?: Record<string, unknown>;
};

export type SCADAConnector = BaseRecord & {
  scada_site_id: string;
  name: string;
  connector_type: string;
  endpoint?: string;
  status?: "enabled" | "disabled" | "error";
  metadata?: Record<string, unknown>;
};

export type SCADATag = BaseRecord & {
  scada_device_id: string;
  key: string;
  value_type: "number" | "string" | "boolean" | "json";
  unit?: string;
  metadata?: Record<string, unknown>;
};

export type SCADALiveValue = BaseRecord & {
  scada_tag_id: string;
  ts: string;
  value: number | string | boolean | Record<string, unknown> | null;
  quality?: string;
};

export type SCADAAlarm = BaseRecord & {
  scada_site_id: string;
  code: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  message: string;
  status: "open" | "acknowledged" | "resolved";
  raised_at: string;
  resolved_at?: string;
};

export type SCADAWorkOrder = BaseRecord & {
  scada_site_id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "blocked" | "closed";
  assigned_to?: string;
  due_at?: string;
};

export type SCADAAnomaly = BaseRecord & {
  scada_site_id: string;
  anomaly_type: string;
  severity?: "low" | "medium" | "high" | "critical";
  detected_at: string;
  description?: string;
  status?: "open" | "investigating" | "resolved";
  metadata?: Record<string, unknown>;
};

export type Report = BaseRecord & {
  report_type: string;
  title: string;
  format?: "pdf" | "xlsx" | "csv" | "json";
  status?: "draft" | "ready" | "failed";
  generated_at?: string;
  file_url?: string;
  metadata?: Record<string, unknown>;
};

export type ExportLock = BaseRecord & {
  resource_type: string;
  resource_id: string;
  locked_by: string;
  locked_at: string;
  expires_at?: string;
  reason?: string;
};

export type AdminSetting = BaseRecord & {
  key: string;
  value: unknown;
  value_type?: "string" | "number" | "boolean" | "json";
  description?: string;
  is_secret?: boolean;
};
