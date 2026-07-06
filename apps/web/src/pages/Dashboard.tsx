import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap, FolderKanban, Activity, HeartPulse } from 'lucide-react'
import { generateSCADAPoints, calcFleetKPIs, calcYield } from '@pvmind/shared'
import { useStore } from '../store'

export default function Dashboard() {
  const { projects, alarms } = useStore()
  const kpis = useMemo(() => calcFleetKPIs(projects), [projects])
  const totalCapacityMw = kpis.total_kwp / 1000

  const scadaPoints = useMemo(() => generateSCADAPoints(kpis.total_kwp, 24), [kpis.total_kwp])
  const todayEnergyMwh = scadaPoints.reduce((s, p) => s + p.energy_kwh, 0) / 1000

  const monthlyEnergy = useMemo(() => {
    const y = calcYield(kpis.total_kwp || 1, 1750, 0.81)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return y.monthly_energy_kwh.map((v, i) => ({ month: months[i], energy_mwh: +(v / 1000).toFixed(1) }))
  }, [kpis.total_kwp])

  const powerChartData = scadaPoints.map(p => ({
    time: new Date(p.timestamp).getHours() + ':00',
    power: p.power_kw,
  }))

  const recentAlarms = [...alarms].sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()).slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Fleet-wide overview across all PV & BESS assets</div>
        </div>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="kpi-card">
          <div className="kpi-label">Total Capacity</div>
          <div className="kpi-value">{totalCapacityMw.toFixed(1)} MW</div>
          <div className="kpi-sub"><Zap size={12} style={{ verticalAlign: 'middle' }} /> across {projects.length} projects</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Projects</div>
          <div className="kpi-value">{kpis.active}</div>
          <div className="kpi-sub"><FolderKanban size={12} style={{ verticalAlign: 'middle' }} /> of {projects.length} total</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Today&apos;s Energy</div>
          <div className="kpi-value">{todayEnergyMwh.toFixed(1)} MWh</div>
          <div className="kpi-sub"><Activity size={12} style={{ verticalAlign: 'middle' }} /> last 24 hours</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fleet Health Score</div>
          <div className="kpi-value">{kpis.health_score}%</div>
          <div className="kpi-sub"><HeartPulse size={12} style={{ verticalAlign: 'middle' }} /> avg PR {kpis.avg_pr}%</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="chart-container">
          <h4 className="mb-3">Real-Time Power (Last 24h)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={powerChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="power" stroke="var(--primary)" strokeWidth={2} dot={false} name="Power (kW)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4 className="mb-3">Monthly Energy Production</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyEnergy}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Bar dataKey="energy_mwh" fill="var(--primary)" name="Energy (MWh)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4 className="mb-3">Project Status</h4>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Capacity</th><th>Status</th></tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.type === 'pv-bess' ? 'PV + BESS' : 'PV'}</td>
                  <td>{(p.capacity_kwp / 1000).toFixed(1)} MW</td>
                  <td>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'draft' ? 'badge-neutral' : 'badge-info'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h4 className="mb-3">Recent Alarms</h4>
          <table className="table">
            <thead>
              <tr><th>Severity</th><th>Message</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentAlarms.map(a => (
                <tr key={a.id}>
                  <td>
                    <span className={`badge ${a.severity === 'critical' ? 'badge-danger' : a.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td>{a.message}</td>
                  <td>
                    <span className={`badge ${a.status === 'active' ? 'badge-danger' : 'badge-success'}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
