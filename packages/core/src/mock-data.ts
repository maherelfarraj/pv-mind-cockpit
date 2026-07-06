import type { CapexItem, DashboardSnapshot, DraftItem, ProjectSummary, Recommendation, YieldPoint } from './types'

const projects: ProjectSummary[] = [
  {
    id: 'al-qunfudhah-150',
    name: 'Al Qunfudhah Hybrid Park',
    location: 'Saudi Arabia',
    capacityMw: 150,
    bessMwh: 300,
    performanceRatio: 0.84,
    status: 'active',
    updatedAt: '2026-07-05T18:45:00.000Z'
  },
  {
    id: 'medina-90',
    name: 'Medina Agrivoltaic Site',
    location: 'Saudi Arabia',
    capacityMw: 90,
    bessMwh: 120,
    performanceRatio: 0.81,
    status: 'review',
    updatedAt: '2026-07-04T14:10:00.000Z'
  },
  {
    id: 'jeddah-port-45',
    name: 'Jeddah Port Rooftop',
    location: 'Saudi Arabia',
    capacityMw: 45,
    bessMwh: 60,
    performanceRatio: 0.79,
    status: 'draft',
    updatedAt: '2026-07-03T08:30:00.000Z'
  }
]

const yieldSeries: YieldPoint[] = [
  { month: 'Jan', yieldMwh: 19200, irradiance: 168 },
  { month: 'Feb', yieldMwh: 18800, irradiance: 161 },
  { month: 'Mar', yieldMwh: 20150, irradiance: 176 },
  { month: 'Apr', yieldMwh: 21420, irradiance: 189 },
  { month: 'May', yieldMwh: 22340, irradiance: 196 },
  { month: 'Jun', yieldMwh: 23110, irradiance: 202 }
]

const capexBreakdown: CapexItem[] = [
  { category: 'Modules', amountUsd: 8200000 },
  { category: 'Inverters', amountUsd: 2200000 },
  { category: 'BESS', amountUsd: 6400000 },
  { category: 'Civil', amountUsd: 1750000 },
  { category: 'SCADA', amountUsd: 920000 }
]

const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Increase clipping margin for June dispatch',
    detail: 'Raise inverter clipping reserve by 2.5% to capture the midday irradiance spike without overcommitting the BESS dispatch window.',
    severity: 'medium'
  },
  {
    id: 'rec-2',
    title: 'Review tracker row spacing at Medina',
    detail: 'The latest shadow run shows a 1.8% yield penalty after 16:00; validate spacing before the IFC package is frozen.',
    severity: 'high'
  },
  {
    id: 'rec-3',
    title: 'Attach SCADA punch list to Jeddah package',
    detail: 'The field team needs the latest PLC point list available offline for the commissioning walkdown.',
    severity: 'low'
  }
]

const drafts: DraftItem[] = [
  {
    id: 'draft-1',
    title: 'IFC variation note',
    content: 'Revise DC cable trench routing near the eastern inverter block.',
    updatedAt: '2026-07-06T09:00:00.000Z',
    synced: false
  },
  {
    id: 'draft-2',
    title: 'Punch list sync',
    content: 'Pending SCADA punch items for inverter station IS-07.',
    updatedAt: '2026-07-05T16:20:00.000Z',
    synced: true
  }
]

export function createMockSnapshot(): DashboardSnapshot {
  return {
    projects: structuredClone(projects),
    yieldSeries: structuredClone(yieldSeries),
    capexBreakdown: structuredClone(capexBreakdown),
    recommendations: structuredClone(recommendations),
    drafts: structuredClone(drafts)
  }
}
