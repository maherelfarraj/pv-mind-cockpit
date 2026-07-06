import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateSCADAPoints } from '@pvmind/shared'
import { useStore } from '../store'

export default function SCADAMonitor() {
  const { activeProject } = useStore()
  const capacity = activeProject?.capacity_kwp ?? 5000
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

  const points = useMemo(() => generateSCADAPoints(capacity, 24), [capacity, tick])
  const current = points[points.length - 1]

  const chartData = points.map(p => ({
    time: new Date(p.timestamp).getHours() + ':00',
    power: p.power_kw,
    irradiance: p.irradiance_wm2 / 10, // scaled to share axis visually
  }))

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
        <div className="kpi-card">
          <div className="kpi-label">Current Power</div>
          <div className="kpi-value">{current.power_kw.toFixed(1)} kW</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Energy (last hr)</div>
          <div className="kpi-value">{current.energy_kwh.toFixed(1)} kWh</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Irradiance</div>
          <div className="kpi-value">{current.irradiance_wm2.toFixed(0)} W/m²</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Module Temp / PR</div>
          <div className="kpi-value">{current.temperature_c.toFixed(1)}°C</div>
          <div className="kpi-sub">PR: {current.pr.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="chart-container">
          <h4 className="mb-3">Power &amp; Irradiance (Last 24h)</h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="power" stroke="var(--primary)" strokeWidth={2} dot={false} name="Power (kW)" />
              <Line type="monotone" dataKey="irradiance" stroke="var(--warning)" strokeWidth={2} dot={false} name="Irradiance (x10 W/m²)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h4 className="mb-3">Plant Layout</h4>
          <svg width="100%" height={280} viewBox="0 0 400 280" style={{ background: '#0b1220', borderRadius: 8 }}>
            {Array.from({ length: 6 }, (_, row) => (
              Array.from({ length: 10 }, (_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={20 + col * 36}
                  y={20 + row * 40}
                  width={28}
                  height={26}
                  rx={2}
                  fill={current.status === 'online' ? 'rgba(14,165,233,0.5)' : 'rgba(148,163,184,0.3)'}
                  stroke="#0ea5e9"
                />
              ))
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
