import { FormEvent, useMemo, useState } from 'react'
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import './App.css'

type RouteSpec = {
  path: string
  title: string
  section: 'General' | 'Projects' | 'Simulation' | 'SCADA' | 'Admin'
  description: string
}

const routes: RouteSpec[] = [
  {
    path: '/',
    title: 'Home',
    section: 'General',
    description: 'Landing space for the cockpit with quick links and current system status.',
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    section: 'General',
    description: 'Portfolio overview, recent activity, and shortcuts for active projects.',
  },
  {
    path: '/projects',
    title: 'Projects',
    section: 'Projects',
    description: 'List and filter projects by status, owner, and timeline.',
  },
  {
    path: '/projects/new',
    title: 'New Project',
    section: 'Projects',
    description: 'Create and initialize a new PV or PV+BESS project workspace.',
  },
  {
    path: '/projects/:projectId',
    title: 'Project Overview',
    section: 'Projects',
    description: 'Track milestones, design progress, and pending actions for the selected project.',
  },
  {
    path: '/projects/:projectId/pv-configurator',
    title: 'PV Configurator',
    section: 'Projects',
    description: 'Configure module layout, inverter strategy, and site-level assumptions.',
  },
  {
    path: '/projects/:projectId/bess-configurator',
    title: 'BESS Configurator',
    section: 'Projects',
    description: 'Set storage capacity, charge strategy, and interconnection constraints.',
  },
  {
    path: '/projects/:projectId/stringing',
    title: 'Stringing',
    section: 'Projects',
    description: 'Design and validate string topology and MPPT allocations.',
  },
  {
    path: '/projects/:projectId/yield',
    title: 'Yield',
    section: 'Projects',
    description: 'Inspect expected energy yield and weather-normalized performance assumptions.',
  },
  {
    path: '/projects/:projectId/capex',
    title: 'CAPEX',
    section: 'Projects',
    description: 'Review EPC cost assumptions, contingencies, and cost breakdown.',
  },
  {
    path: '/projects/:projectId/bom',
    title: 'BOM',
    section: 'Projects',
    description: 'Manage bill of materials quantities, sourcing status, and alternates.',
  },
  {
    path: '/projects/:projectId/sld',
    title: 'SLD',
    section: 'Projects',
    description: 'Generate and review single-line diagram packages.',
  },
  {
    path: '/projects/:projectId/reports',
    title: 'Project Reports',
    section: 'Projects',
    description: 'Compile bankable outputs and project-level summary reports.',
  },
  {
    path: '/projects/:projectId/simulation',
    title: 'Simulation',
    section: 'Simulation',
    description: 'Simulation command center and stage tracking for the selected project.',
  },
  {
    path: '/projects/:projectId/simulation/project-setup',
    title: 'Simulation · Project Setup',
    section: 'Simulation',
    description: 'Define project geometry, timeline, and baseline parameters.',
  },
  {
    path: '/projects/:projectId/simulation/site-weather',
    title: 'Simulation · Site Weather',
    section: 'Simulation',
    description: 'Validate irradiation, temperature, and wind sources for simulations.',
  },
  {
    path: '/projects/:projectId/simulation/variants',
    title: 'Simulation · Variants',
    section: 'Simulation',
    description: 'Compare design alternatives and save scenario variants.',
  },
  {
    path: '/projects/:projectId/simulation/orientation',
    title: 'Simulation · Orientation',
    section: 'Simulation',
    description: 'Set tracker, tilt, and azimuth assumptions for arrays.',
  },
  {
    path: '/projects/:projectId/simulation/system',
    title: 'Simulation · System',
    section: 'Simulation',
    description: 'Configure electrical system architecture and operating constraints.',
  },
  {
    path: '/projects/:projectId/simulation/subarrays',
    title: 'Simulation · Subarrays',
    section: 'Simulation',
    description: 'Manage subarray definitions, capacities, and terrain settings.',
  },
  {
    path: '/projects/:projectId/simulation/pv-module',
    title: 'Simulation · PV Module',
    section: 'Simulation',
    description: 'Select module technology and temperature model assumptions.',
  },
  {
    path: '/projects/:projectId/simulation/inverter',
    title: 'Simulation · Inverter',
    section: 'Simulation',
    description: 'Set inverter clipping, efficiency curves, and dispatch behavior.',
  },
  {
    path: '/projects/:projectId/simulation/stringing-mppt',
    title: 'Simulation · Stringing MPPT',
    section: 'Simulation',
    description: 'Align stringing constraints and MPPT window feasibility.',
  },
  {
    path: '/projects/:projectId/simulation/bifacial',
    title: 'Simulation · Bifacial',
    section: 'Simulation',
    description: 'Tune albedo, rear-side gains, and bifacial mismatch assumptions.',
  },
  {
    path: '/projects/:projectId/simulation/detailed-losses',
    title: 'Simulation · Detailed Losses',
    section: 'Simulation',
    description: 'Configure thermal, soiling, mismatch, and degradation losses.',
  },
  {
    path: '/projects/:projectId/simulation/horizon',
    title: 'Simulation · Horizon',
    section: 'Simulation',
    description: 'Upload and validate far-shading horizon profiles.',
  },
  {
    path: '/projects/:projectId/simulation/near-shadings',
    title: 'Simulation · Near Shadings',
    section: 'Simulation',
    description: 'Assess row-to-row and obstacle-level near shading impacts.',
  },
  {
    path: '/projects/:projectId/simulation/scene-3d',
    title: 'Simulation · Scene 3D',
    section: 'Simulation',
    description: 'Inspect and validate project digital twin geometry.',
  },
  {
    path: '/projects/:projectId/simulation/energy-management',
    title: 'Simulation · Energy Management',
    section: 'Simulation',
    description: 'Define charging/discharging strategy and curtailment priorities.',
  },
  {
    path: '/projects/:projectId/simulation/p50-p90',
    title: 'Simulation · P50/P90',
    section: 'Simulation',
    description: 'Assess uncertainty and risk-adjusted energy outcomes.',
  },
  {
    path: '/projects/:projectId/simulation/run',
    title: 'Simulation · Run',
    section: 'Simulation',
    description: 'Execute simulation jobs and monitor run progress.',
  },
  {
    path: '/projects/:projectId/simulation/results',
    title: 'Simulation · Results',
    section: 'Simulation',
    description: 'Review production outputs and performance indicators.',
  },
  {
    path: '/projects/:projectId/simulation/loss-diagram',
    title: 'Simulation · Loss Diagram',
    section: 'Simulation',
    description: 'Visualize cumulative losses from irradiance to AC export.',
  },
  {
    path: '/projects/:projectId/simulation/report',
    title: 'Simulation · Report',
    section: 'Simulation',
    description: 'Generate simulation report with assumptions and outputs.',
  },
  {
    path: '/scada',
    title: 'SCADA',
    section: 'SCADA',
    description: 'SCADA operations home with fleet-level health and alarms.',
  },
  {
    path: '/scada/overview',
    title: 'SCADA · Overview',
    section: 'SCADA',
    description: 'Snapshot of generation, incidents, and fleet availability.',
  },
  {
    path: '/scada/live-monitor',
    title: 'SCADA · Live Monitor',
    section: 'SCADA',
    description: 'Real-time telemetry feed with fast filtering controls.',
  },
  {
    path: '/scada/site-monitor',
    title: 'SCADA · Site Monitor',
    section: 'SCADA',
    description: 'Site-level operating status across plants and substations.',
  },
  {
    path: '/scada/inverters',
    title: 'SCADA · Inverters',
    section: 'SCADA',
    description: 'Inverter-level alarms, output, and event history.',
  },
  {
    path: '/scada/bess-monitor',
    title: 'SCADA · BESS Monitor',
    section: 'SCADA',
    description: 'Battery charge state, efficiency, and event tracking.',
  },
  {
    path: '/scada/weather-station',
    title: 'SCADA · Weather Station',
    section: 'SCADA',
    description: 'Weather station streams and sensor quality checks.',
  },
  {
    path: '/scada/grid-meter',
    title: 'SCADA · Grid Meter',
    section: 'SCADA',
    description: 'Grid injection/import trends and quality metrics.',
  },
  {
    path: '/scada/connectors',
    title: 'SCADA · Connectors',
    section: 'SCADA',
    description: 'Integrations status for PLC, historian, and external APIs.',
  },
  {
    path: '/scada/tag-dictionary',
    title: 'SCADA · Tag Dictionary',
    section: 'SCADA',
    description: 'Manage telemetry tag mapping, units, and ownership.',
  },
  {
    path: '/scada/historian-trends',
    title: 'SCADA · Historian Trends',
    section: 'SCADA',
    description: 'Inspect historical trends with variable overlays.',
  },
  {
    path: '/scada/alarm-workbench',
    title: 'SCADA · Alarm Workbench',
    section: 'SCADA',
    description: 'Investigate and triage alarm events.',
  },
  {
    path: '/scada/alarm-work-order-queue',
    title: 'SCADA · Alarm Work Order Queue',
    section: 'SCADA',
    description: 'Queue and assign maintenance work orders linked to alarms.',
  },
  {
    path: '/scada/alarm-sla-aging',
    title: 'SCADA · Alarm SLA Aging',
    section: 'SCADA',
    description: 'Track alarm handling performance against SLA targets.',
  },
  {
    path: '/scada/anomaly-board',
    title: 'SCADA · Anomaly Board',
    section: 'SCADA',
    description: 'Prioritize active anomalies by severity and impact.',
  },
  {
    path: '/scada/anomaly-rca',
    title: 'SCADA · Anomaly RCA',
    section: 'SCADA',
    description: 'Run root-cause analysis workflows for persistent faults.',
  },
  {
    path: '/scada/work-orders',
    title: 'SCADA · Work Orders',
    section: 'SCADA',
    description: 'Manage work order lifecycle from creation to closure.',
  },
  {
    path: '/scada/fleet-kpis',
    title: 'SCADA · Fleet KPIs',
    section: 'SCADA',
    description: 'Track fleet-level KPIs for availability and production.',
  },
  {
    path: '/scada/kpi-variance',
    title: 'SCADA · KPI Variance',
    section: 'SCADA',
    description: 'Compare actuals against KPI targets with variance drilldowns.',
  },
  {
    path: '/scada/fleet-health',
    title: 'SCADA · Fleet Health',
    section: 'SCADA',
    description: 'System health summary across assets and communication channels.',
  },
  {
    path: '/scada/reports',
    title: 'SCADA · Reports',
    section: 'SCADA',
    description: 'Generate daily, weekly, and monthly operations reports.',
  },
  {
    path: '/scada/settings',
    title: 'SCADA · Settings',
    section: 'SCADA',
    description: 'Configure roles, defaults, and alarm handling policies.',
  },
  {
    path: '/admin/settings',
    title: 'Admin Settings',
    section: 'Admin',
    description: 'Global platform administration and policy controls.',
  },
  {
    path: '/reports',
    title: 'Reports',
    section: 'General',
    description: 'Cross-module report center for exports and scheduled deliveries.',
  },
]

function Shell({ projectId, onProjectIdChange }: { projectId: string; onProjectIdChange: (value: string) => void }) {
  const location = useLocation()

  const grouped = useMemo(() => {
    return routes.reduce<Record<RouteSpec['section'], RouteSpec[]>>(
      (acc, route) => {
        acc[route.section].push(route)
        return acc
      },
      {
        General: [],
        Projects: [],
        Simulation: [],
        SCADA: [],
        Admin: [],
      },
    )
  }, [])

  const toLink = (path: string) => path.replace(':projectId', projectId.trim() || 'demo-project')

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>PV Mind Cockpit</h1>
        <label className="project-id-field" htmlFor="projectId">
          Project ID for dynamic routes
          <input
            id="projectId"
            value={projectId}
            onChange={(event) => onProjectIdChange(event.target.value)}
            placeholder="demo-project"
          />
        </label>
        {Object.entries(grouped).map(([name, sectionRoutes]) => (
          <section key={name}>
            <h2>{name}</h2>
            <nav>
              {sectionRoutes.map((route) => {
                const href = toLink(route.path)
                const active =
                  location.pathname === href ||
                  (route.path.includes(':projectId') &&
                    location.pathname.startsWith(href) &&
                    route.path.includes('/simulation'))

                return (
                  <NavLink
                    className={active ? 'link active' : 'link'}
                    key={route.path}
                    to={href}
                  >
                    {route.title}
                  </NavLink>
                )
              })}
            </nav>
          </section>
        ))}
      </aside>

      <main className="content">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RoutePage route={route} defaultProjectId={projectId} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

function RoutePage({ route, defaultProjectId }: { route: RouteSpec; defaultProjectId: string }) {
  const [status, setStatus] = useState('In Progress')
  const [notes, setNotes] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const params = useParams()
  const projectId = params.projectId ?? defaultProjectId

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavedAt(new Date().toLocaleString())
  }

  return (
    <article className="page">
      <header>
        <h2>{route.title}</h2>
        <p>{route.description}</p>
      </header>

      <div className="stats">
        <div>
          <span>Current Path</span>
          <strong>{route.path}</strong>
        </div>
        <div>
          <span>Project ID</span>
          <strong>{projectId || 'N/A'}</strong>
        </div>
        <div>
          <span>Module</span>
          <strong>{route.section}</strong>
        </div>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <h3>Workspace Controls</h3>
        <label>
          Workflow status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>In Progress</option>
            <option>Blocked</option>
            <option>Ready for Review</option>
            <option>Completed</option>
          </select>
        </label>
        <label>
          Operator notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder="Add assumptions, tasks, or findings for this route."
          />
        </label>

        <div className="actions">
          <button type="submit">Save Draft</button>
          <button type="button" onClick={() => setNotes('')}>Clear Notes</button>
        </div>

        {savedAt ? <p className="saved">Saved at {savedAt}</p> : null}
      </form>
    </article>
  )
}

function NotFound() {
  return (
    <article className="page">
      <h2>Route not found</h2>
      <p>Use the left navigation to access any supported cockpit route.</p>
    </article>
  )
}

function App() {
  const [projectId, setProjectId] = useState('demo-project')

  return (
    <BrowserRouter>
      <Shell projectId={projectId} onProjectIdChange={setProjectId} />
    </BrowserRouter>
  )
}

export default App
