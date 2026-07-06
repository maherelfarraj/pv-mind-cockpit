import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Play } from 'lucide-react'
import { calcSimulation } from '@pvmind/shared'
import { useStore } from '../store'

const TABS = ['Overview', 'Detailed Losses', 'Horizon', 'Near Shading', '3D Scene', 'P50/P90', 'Results', 'Loss Diagram'] as const
type Tab = typeof TABS[number]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// normal distribution PDF helper for the P50/P90 chart
function normalPdf(x: number, mean: number, sd: number) {
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2))
}

export default function SimulationStudio() {
  const { activeProject } = useStore()
  const capacity = activeProject?.capacity_kwp ?? 5000
  const lat = activeProject?.location.lat ?? 25
  const bess = activeProject?.bess_capacity_kwh ?? 0

  const [tab, setTab] = useState<Tab>('Overview')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasRun, setHasRun] = useState(false)
  const [horizonPoints, setHorizonPoints] = useState<number[]>([2, 3, 5, 8, 6, 4, 3, 2, 1, 2, 3, 2])

  const result = useMemo(() => calcSimulation(capacity, lat, bess), [capacity, lat, bess])

  const runSimulation = () => {
    setRunning(true)
    setProgress(0)
    setHasRun(false)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setRunning(false)
          setHasRun(true)
          return 100
        }
        return p + 10
      })
    }, 120)
  }

  const lossData = [
    { name: 'Soiling', value: result.losses.soiling },
    { name: 'Shading', value: result.losses.shading },
    { name: 'Reflection', value: result.losses.reflection },
    { name: 'Irradiance', value: result.losses.irradiance },
    { name: 'Temperature', value: result.losses.temperature },
    { name: 'Mismatch', value: result.losses.mismatch },
    { name: 'Wiring', value: result.losses.wiring },
    { name: 'Inverter', value: result.losses.inverter },
    { name: 'Transformer', value: result.losses.transformer },
    { name: 'Availability', value: result.losses.availability },
  ]

  // waterfall data: cumulative energy after each loss stage
  const waterfallData = useMemo(() => {
    let remaining = 100
    const stages = [{ name: 'Nameplate', value: 100, base: 0 }]
    for (const l of lossData) {
      const start = remaining
      remaining = remaining * (1 - l.value / 100)
      stages.push({ name: l.name, value: start - remaining, base: remaining })
    }
    stages.push({ name: 'Net Yield', value: remaining, base: 0 })
    return stages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const p50 = result.p50_kwh
  const p90 = result.p90_kwh
  const sd = (p50 - p90) / 1.2816 // approx std dev from P90 exceedance (90% one-sided)
  const distData = useMemo(() => {
    const points = []
    for (let x = p50 - 3.2 * sd; x <= p50 + 3.2 * sd; x += (sd * 6.4) / 60) {
      points.push({ x: Math.round(x), y: normalPdf(x, p50, sd) })
    }
    return points
  }, [p50, sd])

  const exceedanceTable = [10, 25, 50, 75, 90, 95, 99].map(pct => {
    // z-value approximations for common exceedance percentiles
    const zMap: Record<number, number> = { 10: 1.2816, 25: 0.6745, 50: 0, 75: -0.6745, 90: -1.2816, 95: -1.6449, 99: -2.3263 }
    const z = zMap[pct] ?? 0
    return { pct, energy: Math.round(p50 + z * sd) }
  })

  const buildings = [
    { x: 40, w: 45, h: 60 }, { x: 140, w: 30, h: 100 }, { x: 220, w: 60, h: 40 },
  ]
  const trees = [{ x: 320, r: 20 }, { x: 380, r: 28 }]
  const shadingFactor = 3.2

  const rows3d = 5
  const cols3d = 8

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Simulation Studio</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
        <button className="btn btn-primary" onClick={runSimulation} disabled={running}>
          <Play size={14} /> {running ? 'Running…' : 'Run Simulation'}
        </button>
      </div>

      <div className="tab-bar">
        {TABS.map(t => <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === 'Overview' && (
        <div className="card">
          {running && (
            <div className="mb-4">
              <div className="flex justify-between mb-2"><span>Simulating hourly performance…</span><span>{progress}%</span></div>
              <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--primary)' }} /></div>
            </div>
          )}
          {!running && (
            <div className="grid grid-4">
              <div className="kpi-card">
                <div className="kpi-label">P50 Annual Yield</div>
                <div className="kpi-value">{(p50 / 1000).toFixed(1)} MWh</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">P90 Annual Yield</div>
                <div className="kpi-value">{(p90 / 1000).toFixed(1)} MWh</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total Losses</div>
                <div className="kpi-value">{result.losses.total.toFixed(1)}%</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Status</div>
                <div className="kpi-value">
                  <span className={`badge ${hasRun ? 'badge-success' : 'badge-neutral'}`}>{hasRun ? 'Simulated' : 'Baseline'}</span>
                </div>
              </div>
            </div>
          )}
          <p className="text-muted text-sm mt-3">
            Run the simulation to recompute hourly performance across the full year using current array configuration, losses, and site horizon. Results feed the Results, P50/P90 and Loss Diagram tabs.
          </p>
        </div>
      )}

      {tab === 'Detailed Losses' && (
        <div className="chart-container">
          <h4 className="mb-3">Loss Breakdown by Category</h4>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={lossData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} unit="%" />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={100} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="value" fill="var(--warning)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'Horizon' && (
        <div className="card">
          <h4 className="mb-3">Horizon Profile (editable)</h4>
          <svg width="100%" height={200} viewBox="0 0 720 200" style={{ background: '#0b1220', borderRadius: 8 }}>
            <polyline
              points={horizonPoints.map((h, i) => `${i * 60},${180 - h * 12}`).join(' ') + ' 660,180 0,180'}
              fill="rgba(14,165,233,0.25)" stroke="#0ea5e9" strokeWidth={2}
            />
            {horizonPoints.map((h, i) => (
              <circle key={i} cx={i * 60} cy={180 - h * 12} r={5} fill="#0ea5e9" style={{ cursor: 'pointer' }}
                onClick={() => setHorizonPoints(prev => prev.map((v, idx) => idx === i ? (v + 2) % 15 : v))} />
            ))}
          </svg>
          <p className="text-muted text-sm mt-2">Click a point to raise its horizon elevation (wraps at 15°). Points represent azimuth sectors from due North.</p>
        </div>
      )}

      {tab === 'Near Shading' && (
        <div className="card">
          <h4 className="mb-3">Near Shading Scene</h4>
          <svg width="100%" height={220} viewBox="0 0 460 220" style={{ borderRadius: 8 }}>
            <rect width={460} height={220} fill="#0b1220" />
            <line x1={0} y1={180} x2={460} y2={180} stroke="#334155" />
            {buildings.map((b, i) => <rect key={i} x={b.x} y={180 - b.h} width={b.w} height={b.h} fill="#334155" />)}
            {trees.map((t, i) => <circle key={i} cx={t.x} cy={180 - t.r} r={t.r} fill="#166534" />)}
            <rect x={0} y={160} width={460} height={20} fill="#0ea5e9" opacity={0.3} />
            <text x={10} y={30} fill="#94a3b8" fontSize={11}>Obstructions: {buildings.length} buildings, {trees.length} trees</text>
          </svg>
          <p className="mt-2">Estimated near-shading loss: <strong>{shadingFactor}%</strong> of annual yield.</p>
        </div>
      )}

      {tab === '3D Scene' && (
        <div className="card">
          <h4 className="mb-3">3D Array Perspective</h4>
          <svg width="100%" height={260} viewBox="0 0 600 260" style={{ background: '#0b1220', borderRadius: 8 }}>
            {Array.from({ length: rows3d }, (_, row) => {
              const y = 60 + row * 36
              const skew = row * 14
              return (
                <g key={row}>
                  {Array.from({ length: cols3d }, (_, col) => {
                    const x = 30 + col * 62 + skew
                    return (
                      <polygon
                        key={col}
                        points={`${x},${y} ${x + 50},${y - 8} ${x + 50},${y + 14} ${x},${y + 22}`}
                        fill={`rgba(14,165,233,${0.3 + row * 0.12})`}
                        stroke="#0ea5e9"
                      />
                    )
                  })}
                </g>
              )
            })}
          </svg>
          <p className="text-muted text-sm mt-2">Simplified isometric projection of {rows3d} array rows × {cols3d} table columns, illustrating row-to-row self-shading geometry.</p>
        </div>
      )}

      {tab === 'P50/P90' && (
        <div>
          <div className="grid grid-2 mb-4">
            <div className="kpi-card">
              <div className="kpi-label">P50 (Median Estimate)</div>
              <div className="kpi-value">{(p50 / 1000).toFixed(1)} MWh</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">P90 (90% Exceedance)</div>
              <div className="kpi-value">{(p90 / 1000).toFixed(1)} MWh</div>
            </div>
          </div>
          <div className="chart-container mb-4">
            <h4 className="mb-3">Energy Probability Distribution</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="x" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}MWh`} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tick={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} labelFormatter={(v) => `${v} kWh`} />
                <Line type="monotone" dataKey="y" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h4 className="mb-3">Exceedance Probability Table</h4>
            <table className="table">
              <thead><tr><th>Exceedance %</th><th>Annual Energy (MWh)</th></tr></thead>
              <tbody>
                {exceedanceTable.map(row => (
                  <tr key={row.pct}><td>P{row.pct}</td><td>{(row.energy / 1000).toFixed(1)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Results' && (
        <div>
          <div className="grid grid-4 mb-4">
            <div className="kpi-card"><div className="kpi-label">Annual Energy</div><div className="kpi-value">{(p50 / 1000).toFixed(1)} MWh</div></div>
            <div className="kpi-card"><div className="kpi-label">Total Losses</div><div className="kpi-value">{result.losses.total.toFixed(1)}%</div></div>
            <div className="kpi-card"><div className="kpi-label">Peak Hourly Power</div><div className="kpi-value">{Math.max(...result.hourly_power_kw).toFixed(0)} kW</div></div>
            <div className="kpi-card"><div className="kpi-label">P90/P50 Ratio</div><div className="kpi-value">{((p90 / p50) * 100).toFixed(1)}%</div></div>
          </div>
          <div className="chart-container">
            <h4 className="mb-3">Monthly Energy Yield</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={result.monthly_energy_kwh.map((v, i) => ({ month: MONTHS[i], mwh: +(v / 1000).toFixed(1) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                <Bar dataKey="mwh" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'Loss Diagram' && (
        <div className="chart-container">
          <h4 className="mb-3">Loss Waterfall (Nameplate → Net Yield)</h4>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} angle={-30} textAnchor="end" height={70} />
              <YAxis stroke="var(--text-muted)" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Bar dataKey="base" stackId="a" fill="transparent" />
              <Bar dataKey="value" stackId="a" radius={[3, 3, 0, 0]}>
                {waterfallData.map((d, i) => (
                  <Cell key={i} fill={d.name === 'Nameplate' || d.name === 'Net Yield' ? 'var(--primary)' : 'var(--warning)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
