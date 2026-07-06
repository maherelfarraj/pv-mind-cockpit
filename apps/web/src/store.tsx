import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { Project, Alarm, WorkOrder, Anomaly, PVModule, Inverter, BESSUnit } from '@pvmind/shared'

// ============================================================
// Seed / catalog data
// ============================================================
export const SEED_PROJECTS: Project[] = [
  { id: 'p1', name: 'Solar Farm Alpha', type: 'pv', location: { lat: 25.2, lon: 55.3, timezone: 'Asia/Dubai' }, capacity_kwp: 5000, status: 'active', created_at: '2024-01-15', updated_at: '2024-06-01' },
  { id: 'p2', name: 'Desert Sun Beta', type: 'pv-bess', location: { lat: 24.8, lon: 46.7, timezone: 'Asia/Riyadh' }, capacity_kwp: 10000, bess_capacity_kwh: 20000, status: 'active', created_at: '2024-03-10', updated_at: '2024-06-15' },
  { id: 'p3', name: 'Green Valley', type: 'pv', location: { lat: 51.5, lon: -0.1, timezone: 'Europe/London' }, capacity_kwp: 2000, status: 'draft', created_at: '2024-05-20', updated_at: '2024-06-20' },
]

export const PV_MODULES: PVModule[] = [
  { id: 'm1', manufacturer: 'JA Solar', model: 'JAM72S30-545/MR', power_wp: 545, voc: 49.9, isc: 13.92, vmp: 41.8, imp: 13.05, temp_coeff_pmax: -0.35, efficiency: 21.1, dimensions: { length: 2278, width: 1134, height: 35 }, weight: 27.5 },
  { id: 'm2', manufacturer: 'Jinko Solar', model: 'Tiger Neo 78TR', power_wp: 590, voc: 51.8, isc: 14.42, vmp: 43.5, imp: 13.57, temp_coeff_pmax: -0.30, efficiency: 22.3, dimensions: { length: 2384, width: 1303, height: 35 }, weight: 32.6 },
  { id: 'm3', manufacturer: 'Trina Solar', model: 'Vertex S+ 505', power_wp: 505, voc: 46.9, isc: 13.75, vmp: 39.1, imp: 12.93, temp_coeff_pmax: -0.34, efficiency: 21.5, dimensions: { length: 1762, width: 1134, height: 30 }, weight: 21.5 },
  { id: 'm4', manufacturer: 'Canadian Solar', model: 'HiKu7 660', power_wp: 660, voc: 46.6, isc: 18.15, vmp: 38.9, imp: 16.97, temp_coeff_pmax: -0.34, efficiency: 21.3, dimensions: { length: 2384, width: 1303, height: 35 }, weight: 34.8 },
  { id: 'm5', manufacturer: 'LONGi', model: 'Hi-MO 6 575', power_wp: 575, voc: 50.9, isc: 14.05, vmp: 42.6, imp: 13.5, temp_coeff_pmax: -0.29, efficiency: 22.5, dimensions: { length: 2278, width: 1134, height: 35 }, weight: 28.2 },
]

export const INVERTERS: Inverter[] = [
  { id: 'i1', manufacturer: 'Huawei', model: 'SUN2000-110KTL-M2', rated_power_kw: 110, max_dc_power_kw: 165, mppt_count: 12, mppt_voltage_min: 200, mppt_voltage_max: 1000, max_input_current_per_mppt: 26, efficiency_euro: 98.7, efficiency_cec: 98.5 },
  { id: 'i2', manufacturer: 'Sungrow', model: 'SG125HV', rated_power_kw: 125, max_dc_power_kw: 187, mppt_count: 10, mppt_voltage_min: 200, mppt_voltage_max: 1100, max_input_current_per_mppt: 30, efficiency_euro: 98.9, efficiency_cec: 98.7 },
  { id: 'i3', manufacturer: 'SMA', model: 'Sunny Highpower Peak3', rated_power_kw: 150, max_dc_power_kw: 225, mppt_count: 6, mppt_voltage_min: 150, mppt_voltage_max: 1000, max_input_current_per_mppt: 40, efficiency_euro: 98.6, efficiency_cec: 98.4 },
]

export const BESS_UNITS: BESSUnit[] = [
  { id: 'b1', manufacturer: 'CATL', model: 'EnerC 100', capacity_kwh: 100, power_kw: 50, voltage_v: 768, dod: 95, round_trip_efficiency: 92, chemistry: 'LFP' },
  { id: 'b2', manufacturer: 'BYD', model: 'Cube T28 250', capacity_kwh: 250, power_kw: 125, voltage_v: 870, dod: 95, round_trip_efficiency: 93, chemistry: 'LFP' },
  { id: 'b3', manufacturer: 'Tesla', model: 'Megapack 2XL 500', capacity_kwh: 500, power_kw: 250, voltage_v: 950, dod: 96, round_trip_efficiency: 94, chemistry: 'LFP' },
]

const SEED_ALARMS: Alarm[] = [
  { id: 'a1', project_id: 'p1', severity: 'critical', message: 'Inverter INV-03 communication loss', triggered_at: '2024-06-20T08:12:00Z', status: 'active' },
  { id: 'a2', project_id: 'p1', severity: 'warning', message: 'String SC-14 underperformance (>15% deviation)', triggered_at: '2024-06-20T06:45:00Z', status: 'active' },
  { id: 'a3', project_id: 'p2', severity: 'warning', message: 'BESS rack 2 temperature elevated (38°C)', triggered_at: '2024-06-19T14:20:00Z', status: 'active' },
  { id: 'a4', project_id: 'p2', severity: 'info', message: 'Scheduled maintenance window starting', triggered_at: '2024-06-18T09:00:00Z', status: 'resolved', resolved_at: '2024-06-18T12:00:00Z' },
  { id: 'a5', project_id: 'p1', severity: 'critical', message: 'Grid frequency excursion detected', triggered_at: '2024-06-17T22:05:00Z', status: 'resolved', resolved_at: '2024-06-17T22:40:00Z' },
]

const SEED_WORK_ORDERS: WorkOrder[] = [
  { id: 'w1', project_id: 'p1', title: 'Replace faulty inverter fan INV-03', description: 'Fan bearing noise detected during routine inspection, replace before overheating occurs.', priority: 'high', status: 'open', assigned_to: 'M. Alvarez', created_at: '2024-06-20', due_date: '2024-06-25' },
  { id: 'w2', project_id: 'p1', title: 'Clean soiled modules row 12-18', description: 'Soiling losses exceeding 3% threshold on southern rows.', priority: 'medium', status: 'in_progress', assigned_to: 'Field Crew B', created_at: '2024-06-18', due_date: '2024-06-28' },
  { id: 'w3', project_id: 'p2', title: 'BESS rack 2 thermal inspection', description: 'Investigate elevated temperature reading on rack 2 battery modules.', priority: 'high', status: 'open', assigned_to: 'R. Chen', created_at: '2024-06-19', due_date: '2024-06-22' },
  { id: 'w4', project_id: 'p2', title: 'Quarterly torque check on combiner boxes', description: 'Routine preventive maintenance per O&M schedule.', priority: 'low', status: 'closed', assigned_to: 'Field Crew A', created_at: '2024-05-01', due_date: '2024-05-15' },
]

const SEED_ANOMALIES: Anomaly[] = [
  { id: 'an1', project_id: 'p1', type: 'String Underperformance', description: 'String SC-14 producing 18% below array average for 5 consecutive days.', rca: 'Likely soiling accumulation or partial shading from nearby vegetation growth. Recommend visual inspection and cleaning.', confidence: 87, detected_at: '2024-06-19T10:00:00Z' },
  { id: 'an2', project_id: 'p1', type: 'Inverter Clipping', description: 'INV-07 clipping DC power above 98% of rated AC output during peak sun hours.', rca: 'DC/AC oversizing ratio is higher than design intent for this inverter zone. Consider redistributing strings.', confidence: 74, detected_at: '2024-06-18T13:30:00Z' },
  { id: 'an3', project_id: 'p2', type: 'BESS Capacity Fade', description: 'Rack 2 usable capacity down 4.2% versus commissioning baseline.', rca: 'Consistent with expected LFP calendar aging at this cycle count; recommend continued monitoring, no action required yet.', confidence: 91, detected_at: '2024-06-17T09:15:00Z' },
  { id: 'an4', project_id: 'p1', type: 'Grid Voltage Excursion', description: 'Point of common coupling voltage exceeded +10% nominal for 45 seconds.', rca: 'Likely upstream grid disturbance rather than plant-side fault; correlate with utility SCADA logs.', confidence: 68, detected_at: '2024-06-17T22:05:00Z' },
  { id: 'an5', project_id: 'p2', type: 'Communication Gap', description: 'Data logger DL-02 missing 12 minutes of telemetry during overnight window.', rca: 'Possible network switch reboot or firmware update; verify logger uptime logs and NTP sync.', confidence: 81, detected_at: '2024-06-16T03:00:00Z' },
  { id: 'an6', project_id: 'p1', type: 'Reverse Current', description: 'Minor reverse current detected on combiner box CB-05, string 3.', rca: 'Possible blocking diode degradation; schedule inspection during next maintenance visit.', confidence: 63, detected_at: '2024-06-15T11:40:00Z' },
]

interface StoreState {
  projects: Project[]
  alarms: Alarm[]
  workOrders: WorkOrder[]
  anomalies: Anomaly[]
  activeProjectId: string
  setActiveProjectId: (id: string) => void
  addProject: (p: Project) => void
  acknowledgeAlarm: (id: string) => void
  addWorkOrder: (w: WorkOrder) => void
  updateWorkOrder: (id: string, patch: Partial<WorkOrder>) => void
  dismissAnomaly: (id: string) => void
  exportLocks: Record<string, boolean>
  toggleExportLock: (projectId: string) => void
  activeProject: Project | undefined
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS)
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(SEED_WORK_ORDERS)
  const [anomalies, setAnomalies] = useState<Anomaly[]>(SEED_ANOMALIES)
  const [activeProjectId, setActiveProjectId] = useState<string>(SEED_PROJECTS[0].id)
  const [exportLocks, setExportLocks] = useState<Record<string, boolean>>({ p1: false, p2: true, p3: false })

  const addProject = useCallback((p: Project) => {
    setProjects(prev => [...prev, p])
    setActiveProjectId(p.id)
  }, [])

  const acknowledgeAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() } : a))
  }, [])

  const addWorkOrder = useCallback((w: WorkOrder) => {
    setWorkOrders(prev => [w, ...prev])
  }, [])

  const updateWorkOrder = useCallback((id: string, patch: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w))
  }, [])

  const dismissAnomaly = useCallback((id: string) => {
    setAnomalies(prev => prev.filter(a => a.id !== id))
  }, [])

  const toggleExportLock = useCallback((projectId: string) => {
    setExportLocks(prev => ({ ...prev, [projectId]: !prev[projectId] }))
  }, [])

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId])

  const value: StoreState = {
    projects, alarms, workOrders, anomalies, activeProjectId, setActiveProjectId,
    addProject, acknowledgeAlarm, addWorkOrder, updateWorkOrder, dismissAnomaly,
    exportLocks, toggleExportLock, activeProject,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
