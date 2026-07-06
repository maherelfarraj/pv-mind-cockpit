import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateSCADAPoints } from '@pvmind/calc-engine'
import { useStore } from '../store'

export default function SCADAMonitor() {
  const { activeProject } = useStore()
  const capacity = activeProject?.capacity_kwp ?? 5000
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(id)
  }, [])

  const points = useMemo(() => generateSCADAPoints(capacity, 24), [capacity, tick])
  const current = points[points.length - 1]
  const chartData = points.map(p => ({ time: new Date(p.timestamp).getHours() + ':00', power: p.power_kw }))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">SCADA Monitor</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'} · live telemetry (refreshes every 5s)</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${current.status}`} />
          <span className="badge badge-neutral">{current.status.toUpperCase()}</span>
        </div>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="kpi-card"><div className="kpi-label">Current Power</div><div className="kpi-value">{current.power_kw.toFixed(1)} kW</div></div>
        <div className="kpi-card"><div className="kpi-label">Energy (last hr)</div><div className="kpi-value">{current.energy_kwh.toFixed(1)} kWh</div></div>
        <div className="kpi-card"><div className="kpi-label">Irradiance</div><div className="kpi-value">{current.irradiance_wm2.toFixed(0)} W/m²</div></div>
        <div className="kpi-card"><div className="kpi-label">Module Temp</div><div className="kpi-value">{current.temperature_c.toFixed(1)}°C</div><div className="kpi-sub">PR: {(current.pr * 100).toFixed(1)}%</div></div>
      </div>

      <div className="chart-container">
        <h4 className="mb-3">Power Output — Last 24h (kW)</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Line type="monotone" dataKey="power" stroke="var(--primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
