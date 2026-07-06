import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { calcYield } from '@pvmind/shared'
import { useStore } from '../store'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function YieldEstimate() {
  const { activeProject } = useStore()
  const capacity = activeProject?.capacity_kwp ?? 5000
  const irradiance = 1750 - Math.abs(activeProject?.location.lat ?? 25) * 12

  const result = useMemo(() => calcYield(capacity, irradiance, 0.815), [capacity, irradiance])

  const monthlyData = result.monthly_energy_kwh.map((e, i) => ({
    month: MONTHS[i],
    energy_mwh: +(e / 1000).toFixed(1),
    irradiance_kwh_m2: +((irradiance * (e / result.annual_energy_kwh))).toFixed(1),
  }))

  const hourlyProfile = useMemo(() => Array.from({ length: 24 }, (_, h) => {
    const solar = h >= 6 && h <= 18 ? Math.sin((Math.PI * (h - 6)) / 12) : 0
    return { hour: `${h}:00`, power_kw: +(capacity * solar * 0.85).toFixed(1) }
  }), [capacity])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Yield Estimate</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="kpi-card">
          <div className="kpi-label">Annual Energy</div>
          <div className="kpi-value">{(result.annual_energy_kwh / 1000).toFixed(1)} MWh</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Specific Yield</div>
          <div className="kpi-value">{result.specific_yield_kwh_kwp} kWh/kWp</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Performance Ratio</div>
          <div className="kpi-value">{(result.performance_ratio * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Capacity Factor</div>
          <div className="kpi-value">{(result.capacity_factor * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="chart-container">
          <h4 className="mb-3">Monthly Energy Production</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Bar dataKey="energy_mwh" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Energy (MWh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4 className="mb-3">Average Hourly Power Profile</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyProfile}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={11} interval={2} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="power_kw" stroke="var(--warning)" strokeWidth={2} dot={false} name="Power (kW)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h4 className="mb-3">Monthly Irradiance &amp; Energy Table</h4>
        <table className="table">
          <thead><tr><th>Month</th><th>Irradiance (kWh/m²)</th><th>Energy (MWh)</th></tr></thead>
          <tbody>
            {monthlyData.map(m => (
              <tr key={m.month}><td>{m.month}</td><td>{m.irradiance_kwh_m2}</td><td>{m.energy_mwh}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
