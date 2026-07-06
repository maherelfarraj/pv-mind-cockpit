create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core tenancy and user tables
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text,
  role text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  owner_profile_id uuid references public.user_profiles(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_variants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table if not exists public.project_sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  latitude double precision,
  longitude double precision,
  elevation_m double precision,
  timezone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table if not exists public.project_weather_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_site_id uuid not null references public.project_sites(id) on delete cascade,
  file_path text not null,
  source text,
  hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_pv_modules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  manufacturer text,
  model text,
  nominal_power_w numeric,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_inverters (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  manufacturer text,
  model text,
  nominal_power_kw numeric,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_bess (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  manufacturer text,
  model text,
  capacity_kwh numeric,
  power_kw numeric,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_structures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  structure_type text,
  tilt_deg numeric,
  azimuth_deg numeric,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_stringing (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  strings_per_inverter integer,
  modules_per_string integer,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_yield_assumptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  assumptions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_capex_assumptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  assumptions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_bom_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  category text,
  item_name text not null,
  quantity numeric,
  unit text,
  unit_cost numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_sld_nodes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  node_type text not null,
  label text,
  x numeric,
  y numeric,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_sld_edges (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  source_node_id uuid not null references public.project_sld_nodes(id) on delete cascade,
  target_node_id uuid not null references public.project_sld_nodes(id) on delete cascade,
  edge_type text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Simulation tables
create table if not exists public.simulation_projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_variant_id uuid not null references public.project_variants(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_site_weather (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_project_id uuid not null references public.simulation_projects(id) on delete cascade,
  source text,
  weather_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_weather_monthly (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_site_weather_id uuid not null references public.simulation_site_weather(id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  ghi numeric,
  dhi numeric,
  dni numeric,
  ambient_temp_c numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (simulation_site_weather_id, year, month)
);

create table if not exists public.simulation_variants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_project_id uuid not null references public.simulation_projects(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (simulation_project_id, name)
);

create table if not exists public.simulation_orientations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  tilt_deg numeric,
  azimuth_deg numeric,
  tracking_mode text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_subarrays (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  orientation_id uuid references public.simulation_orientations(id) on delete set null,
  name text,
  area_m2 numeric,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_modules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  manufacturer text,
  model text,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_inverters (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  manufacturer text,
  model text,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_stringing (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_bifacial (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  enabled boolean not null default false,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_thermal (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_ohmic (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_module_quality (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_soiling (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_iam (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_auxiliaries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_ageing (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_unavailability (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_losses_spectral (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_horizon_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_horizon_points (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_horizon_profile_id uuid not null references public.simulation_horizon_profiles(id) on delete cascade,
  azimuth_deg numeric not null,
  elevation_deg numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_near_shadings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  geometry jsonb not null default '{}'::jsonb,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_3d_scenes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  name text,
  scene jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_3d_objects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_3d_scene_id uuid not null references public.simulation_3d_scenes(id) on delete cascade,
  object_type text,
  object_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_energy_management (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  strategy text,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_power_factor (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  target_pf numeric,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_grid_limitation (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  max_export_kw numeric,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_p50_p90 (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  p50 numeric,
  p90 numeric,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_variant_id uuid not null references public.simulation_variants(id) on delete cascade,
  run_status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_monthly_results (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_run_id uuid not null references public.simulation_runs(id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  energy_kwh numeric,
  pr numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (simulation_run_id, year, month)
);

create table if not exists public.simulation_loss_diagram (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_run_id uuid not null references public.simulation_runs(id) on delete cascade,
  stages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_run_id uuid not null references public.simulation_runs(id) on delete cascade,
  report_type text,
  file_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_export_locks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_project_id uuid not null references public.simulation_projects(id) on delete cascade,
  export_type text not null,
  locked_by uuid references public.user_profiles(id) on delete set null,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (simulation_project_id, export_type)
);

-- SCADA tables
create table if not exists public.scada_sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_site_id uuid references public.project_sites(id) on delete set null,
  name text not null,
  external_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_devices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_site_id uuid not null references public.scada_sites(id) on delete cascade,
  device_type text,
  vendor text,
  model text,
  serial_number text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_connectors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_device_id uuid references public.scada_devices(id) on delete cascade,
  connector_type text not null,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_tags (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_device_id uuid not null references public.scada_devices(id) on delete cascade,
  tag_key text not null,
  tag_name text,
  unit text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scada_device_id, tag_key)
);

create table if not exists public.scada_live_values (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_tag_id uuid not null unique references public.scada_tags(id) on delete cascade,
  value numeric,
  quality text,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_historian (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_tag_id uuid not null references public.scada_tags(id) on delete cascade,
  value numeric,
  quality text,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_alarms (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_site_id uuid references public.scada_sites(id) on delete set null,
  scada_device_id uuid references public.scada_devices(id) on delete set null,
  severity text,
  alarm_code text,
  message text,
  status text not null default 'open',
  raised_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  cleared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_site_id uuid references public.scada_sites(id) on delete set null,
  scada_alarm_id uuid references public.scada_alarms(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open',
  assigned_to uuid references public.user_profiles(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_anomalies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_site_id uuid references public.scada_sites(id) on delete set null,
  anomaly_type text,
  severity text,
  detected_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_fleet_kpis (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  kpi_date date not null,
  kpi_name text not null,
  kpi_value numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, kpi_date, kpi_name)
);

create table if not exists public.scada_kpi_variance (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  scada_fleet_kpi_id uuid not null references public.scada_fleet_kpis(id) on delete cascade,
  baseline_value numeric,
  actual_value numeric,
  variance_value numeric,
  variance_pct numeric,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scada_fleet_health_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  score_date date not null,
  score numeric,
  factors jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, score_date)
);

-- Misc tables
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  simulation_run_id uuid references public.simulation_runs(id) on delete set null,
  report_type text,
  title text,
  file_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, setting_key)
);

create table if not exists public.export_locks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  resource_type text not null,
  resource_id uuid not null,
  locked_by uuid references public.user_profiles(id) on delete set null,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, resource_type, resource_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  actor_profile_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_profiles_company_id on public.user_profiles (company_id);
create index if not exists idx_projects_company_id on public.projects (company_id);
create index if not exists idx_project_variants_project_id on public.project_variants (project_id);
create index if not exists idx_project_sites_project_id on public.project_sites (project_id);
create index if not exists idx_project_weather_files_project_site_id on public.project_weather_files (project_site_id);
create index if not exists idx_project_sld_nodes_variant_id on public.project_sld_nodes (project_variant_id);
create index if not exists idx_project_sld_edges_variant_id on public.project_sld_edges (project_variant_id);

create index if not exists idx_simulation_projects_variant_id on public.simulation_projects (project_variant_id);
create index if not exists idx_simulation_site_weather_project_id on public.simulation_site_weather (simulation_project_id);
create index if not exists idx_simulation_variants_project_id on public.simulation_variants (simulation_project_id);
create index if not exists idx_simulation_subarrays_variant_id on public.simulation_subarrays (simulation_variant_id);
create index if not exists idx_simulation_runs_variant_id on public.simulation_runs (simulation_variant_id);
create index if not exists idx_simulation_monthly_results_run_id on public.simulation_monthly_results (simulation_run_id);

create index if not exists idx_scada_sites_company_id on public.scada_sites (company_id);
create index if not exists idx_scada_devices_site_id on public.scada_devices (scada_site_id);
create index if not exists idx_scada_tags_device_id on public.scada_tags (scada_device_id);
create index if not exists idx_scada_historian_tag_time on public.scada_historian (scada_tag_id, observed_at desc);
create index if not exists idx_scada_alarms_site_status on public.scada_alarms (scada_site_id, status);

create index if not exists idx_reports_company_id on public.reports (company_id);
create index if not exists idx_audit_logs_company_created_at on public.audit_logs (company_id, created_at desc);

-- Apply updated_at trigger on all mutable tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','user_profiles','projects','project_variants','project_sites','project_weather_files',
    'project_pv_modules','project_inverters','project_bess','project_structures','project_stringing',
    'project_yield_assumptions','project_capex_assumptions','project_bom_items','project_sld_nodes','project_sld_edges',
    'simulation_projects','simulation_site_weather','simulation_weather_monthly','simulation_variants',
    'simulation_orientations','simulation_subarrays','simulation_modules','simulation_inverters','simulation_stringing',
    'simulation_bifacial','simulation_losses_thermal','simulation_losses_ohmic','simulation_losses_module_quality',
    'simulation_losses_soiling','simulation_losses_iam','simulation_losses_auxiliaries','simulation_losses_ageing',
    'simulation_losses_unavailability','simulation_losses_spectral','simulation_horizon_profiles',
    'simulation_horizon_points','simulation_near_shadings','simulation_3d_scenes','simulation_3d_objects',
    'simulation_energy_management','simulation_power_factor','simulation_grid_limitation','simulation_p50_p90',
    'simulation_runs','simulation_monthly_results','simulation_loss_diagram','simulation_reports',
    'simulation_export_locks','scada_sites','scada_devices','scada_connectors','scada_tags','scada_live_values',
    'scada_historian','scada_alarms','scada_work_orders','scada_anomalies','scada_fleet_kpis','scada_kpi_variance',
    'scada_fleet_health_scores','reports','admin_settings','export_locks','audit_logs'
  ]
  LOOP
    EXECUTE format('drop trigger if exists trg_%I_set_updated_at on public.%I', t, t);
    EXECUTE format('create trigger trg_%I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  END LOOP;
END
$$;

-- Enable RLS on all domain tables (policy definitions can be added later).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','user_profiles','projects','project_variants','project_sites','project_weather_files',
    'project_pv_modules','project_inverters','project_bess','project_structures','project_stringing',
    'project_yield_assumptions','project_capex_assumptions','project_bom_items','project_sld_nodes','project_sld_edges',
    'simulation_projects','simulation_site_weather','simulation_weather_monthly','simulation_variants',
    'simulation_orientations','simulation_subarrays','simulation_modules','simulation_inverters','simulation_stringing',
    'simulation_bifacial','simulation_losses_thermal','simulation_losses_ohmic','simulation_losses_module_quality',
    'simulation_losses_soiling','simulation_losses_iam','simulation_losses_auxiliaries','simulation_losses_ageing',
    'simulation_losses_unavailability','simulation_losses_spectral','simulation_horizon_profiles',
    'simulation_horizon_points','simulation_near_shadings','simulation_3d_scenes','simulation_3d_objects',
    'simulation_energy_management','simulation_power_factor','simulation_grid_limitation','simulation_p50_p90',
    'simulation_runs','simulation_monthly_results','simulation_loss_diagram','simulation_reports',
    'simulation_export_locks','scada_sites','scada_devices','scada_connectors','scada_tags','scada_live_values',
    'scada_historian','scada_alarms','scada_work_orders','scada_anomalies','scada_fleet_kpis','scada_kpi_variance',
    'scada_fleet_health_scores','reports','admin_settings','export_locks','audit_logs'
  ]
  LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
  END LOOP;
END
$$;
