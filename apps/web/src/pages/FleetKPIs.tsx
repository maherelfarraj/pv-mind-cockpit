import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { calcFleetKPIs } from '@pvmind/shared'
import { useStore } from '../store'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export default function FleetKPIs() {
  const { projects } = useStore()
  const kpis = useMemo(() => calcFleetKPIs(projects), [projects])

  const perProjectPerf = projects.map(p => ({
    name: p.name,
    mw: +(p.capacity_kwp / 1000).toFixed(1),
  }))

  const prTrend = MONTHS.map((m, i) => ({ month: m, pr: +(80 + Math.sin(i) * 2 + i * 0.3).toFixed(1) }))

  const availability = projects.map(p => ({
    name: p.name,
    availability: p.status === 'active' ? 97 + Math.random() * 2 : 0,
  }))

  // SVG arc gauge for health score
  const radius = 70
  const circumference = Math.PI * radius
  const scoreFraction = kpis.health_score / 100
  const dashOffset = circumference * (1 - scoreFraction)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Fleet KPIs</div>
          <div className="page-subtitle">Portfolio-wide performance and availability</div>
        </div>
      </div>

      <div className="grid grid-3 mb-4">
        <div className="kpi-card">
          <div className="kpi-label">Total Fleet Capacity</div>
          <div className="kpi-value">{(kpis.total_kwp / 1000).toFixed(1)} MW</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Projects</div>
          <div className="kpi-value">{kpis.active} / {projects.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Performance Ratio</div>
          <div className="kpi-value">{kpis.avg_pr}%</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 className="mb-3" style={{ alignSelf: 'flex-start' }}>Fleet Health Score</h4>
          <svg width={200} height={120} viewBox="0 0 200 120">
            <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="var(--border)" strokeWidth={14} strokeLinecap="round" />
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="var(--success)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
            <text x={100} y={95} textAnchor="middle" fontSize={28} fontWeight={700} fill="var(--text)">{kpis.health_score}%</text>
          </svg>
        </div>
        <div className="chart-container">
          <h4 className="mb-3">Capacity by Project</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perProjectPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Bar dataKey="mw" fill="var(--primary)" radius={[4, 4, 0, 0]} name="MW" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="chart-container">
          <h4 className="mb-3">Performance Ratio Trend</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={prTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[70, 90]} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="pr" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} name="PR (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h4 className="mb-3">Availability by Project</h4>
          <table className="table">
            <thead><tr><th>Project</th><th>Availability</th></tr></thead>
            <tbody>
              {availability.map(a => (
                <tr key={a.name}>
                  <td>{a.name}</td>
                  <td>{a.availability > 0 ? `${a.availability.toFixed(1)}%` : <span className="text-muted">N/A (draft)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
