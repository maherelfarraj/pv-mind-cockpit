import { useMemo, useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Zap, FolderKanban, Activity, Bell } from 'lucide-react'
import { calcFleetKPIs, generateSCADAPoints, calcAnnualYield } from '@pvmind/calc-engine'
import { useStore } from '../store'

export default function Dashboard() {
  const { projects, alarms } = useStore()
  const kpis = useMemo(() => calcFleetKPIs(projects), [projects])
  const totalMw = (kpis.total_kwp / 1000).toFixed(1)

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(id)
  }, [])

  const scadaPoints = useMemo(() => generateSCADAPoints(kpis.total_kwp, 24), [kpis.total_kwp, tick])
  const todayMwh = (scadaPoints.reduce((s, p) => s + p.energy_kwh, 0) / 1000).toFixed(1)
  const yieldRes = useMemo(() => calcAnnualYield({ capacity_kwp: kpis.total_kwp, annual_ghi_kwh_m2: 1800, performance_ratio: 0.81 }), [kpis.total_kwp])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyData = (yieldRes.monthly_energy_kwh as number[]).map((v, i) => ({ month: months[i], energy: +(v / 1000).toFixed(1) }))
  const powerData = scadaPoints.map(p => ({ time: new Date(p.timestamp).getHours() + ':00', power: p.power_kw }))
  const activeAlarms = alarms.filter(a => a.status === 'active')

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Fleet-wide overview across all PV &amp; BESS assets</div>
        </div>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="kpi-card"><div className="kpi-label">Total Capacity</div><div className="kpi-value">{totalMw} MW</div><div className="kpi-sub"><Zap size={12} style={{ verticalAlign: 'middle' }} /> {projects.length} projects</div></div>
        <div className="kpi-card"><div className="kpi-label">Active Projects</div><div className="kpi-value">{kpis.active}</div><div className="kpi-sub"><FolderKanban size={12} style={{ verticalAlign: 'middle' }} /> of {projects.length} total</div></div>
        <div className="kpi-card"><div className="kpi-label">Today's Energy</div><div className="kpi-value">{todayMwh} MWh</div><div className="kpi-sub"><Activity size={12} style={{ verticalAlign: 'middle' }} /> last 24 h</div></div>
        <div className="kpi-card"><div className="kpi-label">Active Alarms</div><div className="kpi-value" style={{ color: activeAlarms.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{activeAlarms.length}</div><div className="kpi-sub"><Bell size={12} style={{ verticalAlign: 'middle' }} /> requires attention</div></div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="chart-container">
          <h4 className="mb-3">Power Output — Last 24h (kW)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="power" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4 className="mb-3">Monthly Energy (MWh)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="energy" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {activeAlarms.length > 0 && (
        <div className="card">
          <h4 className="mb-3">Active Alarms</h4>
          <div className="table-container">
            <table>
              <thead><tr><th>Severity</th><th>Message</th><th>Triggered</th></tr></thead>
              <tbody>
                {activeAlarms.slice(0, 5).map(a => (
                  <tr key={a.id}>
                    <td><span className={`badge badge-${a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}`}>{a.severity}</span></td>
                    <td>{a.message}</td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(a.triggered_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
