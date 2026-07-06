import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Project, Alarm, WorkOrder } from '@pvmind/types'

const SEED_PROJECTS: Project[] = [
  { id: 'p1', name: 'Solar Farm Alpha', type: 'pv', status: 'active', location: { lat: 25.2, lon: 55.3, timezone: 'Asia/Dubai' }, capacity_kwp: 5000, created_at: '2024-01-15', updated_at: '2024-06-01' },
  { id: 'p2', name: 'Desert Sun Beta', type: 'pv-bess', status: 'active', location: { lat: 24.8, lon: 46.7, timezone: 'Asia/Riyadh' }, capacity_kwp: 10000, bess_capacity_kwh: 20000, created_at: '2024-03-10', updated_at: '2024-06-15' },
  { id: 'p3', name: 'Green Valley', type: 'pv', status: 'draft', location: { lat: 51.5, lon: -0.1, timezone: 'Europe/London' }, capacity_kwp: 2000, created_at: '2024-05-20', updated_at: '2024-06-20' },
]

const SEED_ALARMS: Alarm[] = [
  { id: 'a1', project_id: 'p1', severity: 'critical', message: 'Inverter INV-03 communication loss', triggered_at: '2024-06-20T08:12:00Z', status: 'active' },
  { id: 'a2', project_id: 'p1', severity: 'warning', message: 'String SC-14 underperformance (>15% deviation)', triggered_at: '2024-06-20T06:45:00Z', status: 'active' },
  { id: 'a3', project_id: 'p2', severity: 'warning', message: 'BESS rack 2 temperature elevated (38°C)', triggered_at: '2024-06-19T14:20:00Z', status: 'active' },
]

const SEED_WORK_ORDERS: WorkOrder[] = [
  { id: 'w1', project_id: 'p1', title: 'Replace faulty inverter fan INV-03', description: 'Fan bearing noise detected, replace before overheating.', priority: 'high', status: 'open', created_at: '2024-06-20' },
  { id: 'w2', project_id: 'p1', title: 'Clean soiled modules row 12-18', description: 'Soiling losses exceeding 3% threshold.', priority: 'medium', status: 'in_progress', created_at: '2024-06-18' },
]

interface StoreState {
  projects: Project[]
  alarms: Alarm[]
  workOrders: WorkOrder[]
  activeProjectId: string
  setActiveProjectId: (id: string) => void
  addProject: (p: Project) => void
  acknowledgeAlarm: (id: string) => void
  addWorkOrder: (w: WorkOrder) => void
  activeProject: Project | undefined
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS)
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(SEED_WORK_ORDERS)
  const [activeProjectId, setActiveProjectId] = useState<string>(SEED_PROJECTS[0].id)

  const addProject = useCallback((p: Project) => setProjects(prev => [p, ...prev]), [])
  const acknowledgeAlarm = useCallback((id: string) => setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as const } : a)), [])
  const addWorkOrder = useCallback((w: WorkOrder) => setWorkOrders(prev => [w, ...prev]), [])
  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <StoreContext.Provider value={{ projects, alarms, workOrders, activeProjectId, setActiveProjectId, addProject, acknowledgeAlarm, addWorkOrder, activeProject }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
