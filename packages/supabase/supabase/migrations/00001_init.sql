-- PV Mind Cockpit — Initial Database Schema
-- Migration: 00001_init
-- Enables RLS on all tables for secure multi-tenant access.

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE simulation_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'viewer');

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  organization  TEXT,
  role          user_role NOT NULL DEFAULT 'engineer',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  location_name   TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  status          project_status NOT NULL DEFAULT 'draft',
  currency        TEXT NOT NULL DEFAULT 'USD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own projects"
  ON projects USING (auth.uid() = owner_id);

-- ─── PV Designs ───────────────────────────────────────────────────────────────
CREATE TABLE pv_designs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL DEFAULT 'PV Design 1',
  daily_load_kwh        DOUBLE PRECISION,
  peak_sun_hours        DOUBLE PRECISION,
  system_efficiency     DOUBLE PRECISION,
  module_power_wp       DOUBLE PRECISION,
  module_area_m2        DOUBLE PRECISION,
  modules_per_string    INTEGER,
  strings_count         INTEGER,
  array_kwp             DOUBLE PRECISION,
  inverter_capacity_kw  DOUBLE PRECISION,
  annual_production_mwh DOUBLE PRECISION,
  performance_ratio     DOUBLE PRECISION,
  tilt_deg              DOUBLE PRECISION,
  azimuth_deg           DOUBLE PRECISION,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pv_designs_project ON pv_designs(project_id);
ALTER TABLE pv_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project owner can CRUD PV designs"
  ON pv_designs USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = pv_designs.project_id AND projects.owner_id = auth.uid())
  );

-- ─── BESS Designs ─────────────────────────────────────────────────────────────
CREATE TABLE bess_designs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL DEFAULT 'BESS Design 1',
  required_energy_kwh     DOUBLE PRECISION,
  dod                     DOUBLE PRECISION,
  round_trip_efficiency   DOUBLE PRECISION,
  backup_hours            DOUBLE PRECISION,
  gross_capacity_kwh      DOUBLE PRECISION,
  peak_power_kw           DOUBLE PRECISION,
  nominal_voltage_v       DOUBLE PRECISION,
  nominal_capacity_ah     DOUBLE PRECISION,
  series_count            INTEGER,
  parallel_count          INTEGER,
  chemistry               TEXT,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bess_designs_project ON bess_designs(project_id);
ALTER TABLE bess_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project owner can CRUD BESS designs"
  ON bess_designs USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = bess_designs.project_id AND projects.owner_id = auth.uid())
  );

-- ─── Simulations ──────────────────────────────────────────────────────────────
CREATE TABLE simulations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pv_design_id            UUID REFERENCES pv_designs(id) ON DELETE SET NULL,
  bess_design_id          UUID REFERENCES bess_designs(id) ON DELETE SET NULL,
  name                    TEXT NOT NULL DEFAULT 'Simulation 1',
  status                  simulation_status NOT NULL DEFAULT 'pending',
  annual_ac_mwh           DOUBLE PRECISION,
  specific_yield_kwh_kwp  DOUBLE PRECISION,
  capacity_factor         DOUBLE PRECISION,
  performance_ratio       DOUBLE PRECISION,
  co2_avoided_tonnes      DOUBLE PRECISION,
  lcoe_usd_kwh            DOUBLE PRECISION,
  error_message           TEXT,
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simulations_project ON simulations(project_id);
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project owner can CRUD simulations"
  ON simulations USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = simulations.project_id AND projects.owner_id = auth.uid())
  );

-- ─── SCADA Readings ───────────────────────────────────────────────────────────
CREATE TABLE scada_readings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  device_id         TEXT NOT NULL,
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ac_power_kw       DOUBLE PRECISION,
  dc_power_kw       DOUBLE PRECISION,
  energy_today_kwh  DOUBLE PRECISION,
  energy_total_mwh  DOUBLE PRECISION,
  irradiance_w_m2   DOUBLE PRECISION,
  module_temp_c     DOUBLE PRECISION,
  ambient_temp_c    DOUBLE PRECISION,
  frequency_hz      DOUBLE PRECISION,
  voltage_v         DOUBLE PRECISION,
  current_a         DOUBLE PRECISION,
  pr                DOUBLE PRECISION,
  status            TEXT,
  alarms            TEXT[]
);

CREATE INDEX idx_scada_project_device_time ON scada_readings(project_id, device_id, timestamp DESC);
ALTER TABLE scada_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project owner can read/insert SCADA data"
  ON scada_readings USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scada_readings.project_id AND projects.owner_id = auth.uid())
  );

-- ─── Updated-at triggers ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pv_designs_updated_at BEFORE UPDATE ON pv_designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bess_designs_updated_at BEFORE UPDATE ON bess_designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_simulations_updated_at BEFORE UPDATE ON simulations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
