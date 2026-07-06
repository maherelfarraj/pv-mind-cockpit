import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { calcCAPEX } from '@pvmind/shared'
import { useStore } from '../store'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f472b6', '#eab308']

export default function CAPEXEstimate() {
  const { activeProject } = useStore()
  const capacity = activeProject?.capacity_kwp ?? 5000
  const bess = activeProject?.bess_capacity_kwh ?? 0

  const result = useMemo(() => calcCAPEX(capacity, bess), [capacity, bess])

  const sensitivity = useMemo(() => {
    return [-20, -10, 0, 10, 20].map(pct => {
      const factor = 1 + pct / 100
      const modulesLine = result.breakdown.find(b => b.category === 'PV Modules')
      const moduleCostDelta = (modulesLine?.amount_usd ?? 0) * (factor - 1)
      const newTotal = result.total_usd + moduleCostDelta
      return { pct, total: newTotal, per_kwp: newTotal / (capacity || 1) }
    })
  }, [result, capacity])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">CAPEX Estimate</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="kpi-card">
          <div className="kpi-label">Total CAPEX</div>
          <div className="kpi-value">${(result.total_usd / 1_000_000).toFixed(2)}M</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cost per kWp</div>
          <div className="kpi-value">${result.per_kwp_usd.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="chart-container">
          <h4 className="mb-3">Cost Breakdown</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={result.breakdown} dataKey="amount_usd" nameKey="category" cx="50%" cy="50%" outerRadius={95} label={(entry) => `${entry.category}`}>
                {result.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h4 className="mb-3">Breakdown Table</h4>
          <table className="table">
            <thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead>
            <tbody>
              {result.breakdown.map(b => (
                <tr key={b.category}>
                  <td>{b.category}</td>
                  <td>${b.amount_usd.toLocaleString()}</td>
                  <td>{((b.amount_usd / result.total_usd) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td>Total</td>
                <td>${result.total_usd.toLocaleString()}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h4 className="mb-3">Module Cost Sensitivity Analysis</h4>
        <table className="table">
          <thead><tr><th>Module Cost Delta</th><th>Total CAPEX</th><th>$/kWp</th></tr></thead>
          <tbody>
            {sensitivity.map(s => (
              <tr key={s.pct}>
                <td>{s.pct > 0 ? '+' : ''}{s.pct}%</td>
                <td>${s.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td>${s.per_kwp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
