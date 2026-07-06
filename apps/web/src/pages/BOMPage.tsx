import { useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { calcBOM } from '@pvmind/shared'
import { useStore } from '../store'
import Modal from '../components/Modal'

export default function BOMPage() {
  const { activeProject } = useStore()
  const capacity = activeProject?.capacity_kwp ?? 5000
  const bess = activeProject?.bess_capacity_kwh ?? 0
  const [category, setCategory] = useState('all')
  const [showPreview, setShowPreview] = useState(false)

  const lines = useMemo(() => calcBOM(capacity, 550, bess), [capacity, bess])
  const categories = useMemo(() => ['all', ...Array.from(new Set(lines.map(l => l.category)))], [lines])
  const filtered = category === 'all' ? lines : lines.filter(l => l.category === category)
  const total = filtered.reduce((s, l) => s + l.total_cost_usd, 0)

  const exportCsv = () => {
    const header = 'Category,Description,Quantity,Unit,Unit Cost (USD),Total Cost (USD)\n'
    const rows = filtered.map(l => `${l.category},"${l.description}",${l.quantity},${l.unit},${l.unit_cost_usd},${l.total_cost_usd}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeProject?.name ?? 'project'}-bom.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Bill of Materials</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={exportCsv}><Download size={14} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowPreview(true)}><Printer size={14} /> Export PDF</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="form-group" style={{ maxWidth: 260 }}>
          <label className="form-label">Filter by Category</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>
        <table className="table">
          <thead>
            <tr><th>Category</th><th>Description</th><th>Qty</th><th>Unit</th><th>Unit Cost</th><th>Total Cost</th></tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i}>
                <td><span className="badge badge-info">{l.category}</span></td>
                <td>{l.description}</td>
                <td>{l.quantity.toLocaleString()}</td>
                <td>{l.unit}</td>
                <td>${l.unit_cost_usd.toLocaleString()}</td>
                <td>${l.total_cost_usd.toLocaleString()}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700 }}>
              <td colSpan={5}>Total</td>
              <td>${total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {showPreview && (
        <Modal title="BOM Report Preview" onClose={() => setShowPreview(false)} width={720}>
          <div style={{ background: 'white', color: '#111', padding: 20, borderRadius: 6 }}>
            <h2 style={{ marginBottom: 4 }}>{activeProject?.name ?? 'Project'} — Bill of Materials</h2>
            <p style={{ color: '#555', marginBottom: 16 }}>Capacity: {(capacity / 1000).toFixed(1)} MWp{bess ? ` · BESS: ${(bess / 1000).toFixed(1)} MWh` : ''}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: 6 }}>Description</th>
                  <th style={{ textAlign: 'right', padding: 6 }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: 6 }}>Total (USD)</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: 6 }}>{l.description}</td>
                    <td style={{ textAlign: 'right', padding: 6 }}>{l.quantity.toLocaleString()} {l.unit}</td>
                    <td style={{ textAlign: 'right', padding: 6 }}>${l.total_cost_usd.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <button className="btn" onClick={() => setShowPreview(false)}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}><Printer size={14} /> Print / Save as PDF</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
