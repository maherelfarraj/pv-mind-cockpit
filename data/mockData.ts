import { MOBILE_AUTH_CALLBACK_URI } from '@/constants/branding';

export type Project = {
  id: string;
  name: string;
  location: string;
  status: 'Concept' | 'Engineering' | 'Construction' | 'Commissioning';
  capacityMw: number;
  bessMWh: number;
  yieldGWh: number;
  capexUsdM: number;
  scadaAvailability: number;
  alarms: number;
  workOrders: number;
  lastUpdate: string;
};

export type AlarmItem = {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  project: string;
  timestamp: string;
  message: string;
};

export type ReportItem = {
  id: string;
  title: string;
  cadence: string;
  lastGenerated: string;
  description: string;
};


export const callbackUri = MOBILE_AUTH_CALLBACK_URI;

export const projects: Project[] = [
  {
    id: 'riyadh-hub',
    name: 'Riyadh Solar Hub',
    location: 'Riyadh, Saudi Arabia',
    status: 'Construction',
    capacityMw: 120,
    bessMWh: 48,
    yieldGWh: 262,
    capexUsdM: 91.4,
    scadaAvailability: 99.2,
    alarms: 4,
    workOrders: 3,
    lastUpdate: 'Updated 18 minutes ago',
  },
  {
    id: 'neom-edge',
    name: 'NEOM Edge Hybrid Plant',
    location: 'Tabuk, Saudi Arabia',
    status: 'Engineering',
    capacityMw: 80,
    bessMWh: 36,
    yieldGWh: 188,
    capexUsdM: 67.8,
    scadaAvailability: 98.8,
    alarms: 2,
    workOrders: 1,
    lastUpdate: 'Updated 42 minutes ago',
  },
  {
    id: 'oman-coast',
    name: 'Oman Coast PV + BESS',
    location: 'Duqm, Oman',
    status: 'Commissioning',
    capacityMw: 65,
    bessMWh: 24,
    yieldGWh: 141,
    capexUsdM: 48.6,
    scadaAvailability: 99.7,
    alarms: 1,
    workOrders: 2,
    lastUpdate: 'Updated 6 minutes ago',
  },
];

export const alarms: AlarmItem[] = [
  {
    id: 'alm-001',
    title: 'Inverter string mismatch',
    severity: 'High',
    project: 'Riyadh Solar Hub',
    timestamp: '10 minutes ago',
    message: 'DC string 14 is underperforming by 18% versus model baseline.',
  },
  {
    id: 'alm-002',
    title: 'BESS HVAC maintenance due',
    severity: 'Medium',
    project: 'Oman Coast PV + BESS',
    timestamp: '27 minutes ago',
    message: 'Preventive HVAC inspection is required before the next dispatch window.',
  },
  {
    id: 'alm-003',
    title: 'Weather station packet delay',
    severity: 'Low',
    project: 'NEOM Edge Hybrid Plant',
    timestamp: '1 hour ago',
    message: 'Telemetry latency exceeded 12 seconds during the last sample batch.',
  },
];

export const reports: ReportItem[] = [
  {
    id: 'rep-001',
    title: 'Executive Portfolio Snapshot',
    cadence: 'Daily',
    lastGenerated: 'Today, 08:00',
    description: 'A cross-project KPI summary for generation, availability, and risk.',
  },
  {
    id: 'rep-002',
    title: 'Work Order Backlog',
    cadence: 'Weekly',
    lastGenerated: 'Mon, 07:30',
    description: 'Pending field actions grouped by severity, site, and assignee.',
  },
  {
    id: 'rep-003',
    title: 'Revenue and Yield Variance',
    cadence: 'Monthly',
    lastGenerated: '01 Jul 2026',
    description: 'Commercial variance against modeled yield and dispatch assumptions.',
  },
];

export function findProjectById(projectId?: string | string[]) {
  if (!projectId) {
    return undefined;
  }

  const id = Array.isArray(projectId) ? projectId[0] : projectId;
  return projects.find((project) => project.id === id);
}
