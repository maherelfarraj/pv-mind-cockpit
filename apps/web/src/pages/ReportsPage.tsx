import { useState } from 'react'
import { FileText, Printer } from 'lucide-react'
import { calcYield, calcCAPEX } from '@pvmind/shared'
import { useStore } from '../store'
import Modal from '../components/Modal'

interface ReportType {
  id: string
  title: string
  description: string
}

const REPORT_TYPES: ReportType[] = [
  { id: 'yield', title: 'Yield Report', description: 'Annual & monthly energy yield, performance ratio, and capacity factor summary.' },
  { id: 'design', title: 'Design Report', description: 'Array configuration, stringing, module and inverter specifications.' },
  { id: 'capex', title: 'CAPEX Report', description: 'Full capital expenditure breakdown with per-kWp normalized costs.' },
  { id: 'environmental', title: 'Environmental Report', description: 'Estimated CO₂ offset, equivalent trees planted, and land use summary.' },
]

export default function ReportsPage() {
  const { activeProject } = useStore()
  const [previewId, setPreviewId] = useState<string | null>(null)

  const capacity = activeProject?.capacity_kwp ?? 5000
  const bess = activeProject?.bess_capacity_kwh ?? 0
  const lat = activeProject?.location.lat ?? 25
  const yieldResult = calcYield(capacity, 1750 - Math.abs(lat) * 12, 0.815)
  const capexResult = calcCAPEX(capacity, bess)
  const co2OffsetTons = (yieldResult.annual_energy_kwh * 0.0007).toFixed(0)
  const treesEquivalent = Math.round(yieldResult.annual_energy_kwh * 0.0007 * 45)
  const landUseHa = (capacity / 1000 * 1.6).toFixed(1)

  const reportBody: Record<string, JSX.Element> = {
    yield: (
      <div>
        <p>Annual Energy: <strong>{(yieldResult.annual_energy_kwh / 1000).toFixed(1)} MWh</strong></p>
        <p>Specific Yield: <strong>{yieldResult.specific_yield_kwh_kwp} kWh/kWp</strong></p>
        <p>Performance Ratio: <strong>{(yieldResult.performance_ratio * 100).toFixed(1)}%</strong></p>
        <p>Capacity Factor: <strong>{(yieldResult.capacity_factor * 100).toFixed(1)}%</strong></p>
      </div>
    ),
    design: (
      <div>
        <p>Project Type: <strong>{activeProject?.type === 'pv-bess' ? 'PV + BESS' : 'PV Only'}</strong></p>
        <p>Total Capacity: <strong>{(capacity / 1000).toFixed(1)} MWp</strong></p>
        <p>Location: <strong>{activeProject?.location.lat}, {activeProject?.location.lon} ({activeProject?.location.timezone})</strong></p>
        {bess > 0 && <p>BESS Capacity: <strong>{(bess / 1000).toFixed(1)} MWh</strong></p>}
      </div>
    ),
    capex: (
      <div>
        <p>Total CAPEX: <strong>${(capexResult.total_usd / 1_000_000).toFixed(2)}M</strong></p>
        <p>Cost per kWp: <strong>${capexResult.per_kwp_usd.toLocaleString()}</strong></p>
        <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {capexResult.breakdown.map(b => (
              <tr key={b.category} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: 4 }}>{b.category}</td>
                <td style={{ padding: 4, textAlign: 'right' }}>${b.amount_usd.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    environmental: (
      <div>
        <p>Estimated CO₂ Offset: <strong>{co2OffsetTons} tons/year</strong></p>
        <p>Equivalent Trees Planted: <strong>{treesEquivalent.toLocaleString()}</strong></p>
        <p>Estimated Land Use: <strong>{landUseHa} hectares</strong></p>
      </div>
    ),
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
      </div>

      <div className="grid grid-2">
        {REPORT_TYPES.map(r => (
          <div className="card" key={r.id}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} color="var(--primary)" />
              <h4>{r.title}</h4>
            </div>
            <p className="text-muted text-sm mb-3">{r.description}</p>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setPreviewId(r.id)}>Generate Preview</button>
              <button className="btn btn-primary" onClick={() => { setPreviewId(r.id); setTimeout(() => window.print(), 200) }}>
                <Printer size={14} /> Export PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewId && (
        <Modal title={`${REPORT_TYPES.find(r => r.id === previewId)?.title} Preview`} onClose={() => setPreviewId(null)} width={640}>
          <div style={{ background: 'white', color: '#111', padding: 20, borderRadius: 6 }}>
            <h2>{activeProject?.name ?? 'Project'}</h2>
            <p style={{ color: '#555', marginBottom: 14 }}>{REPORT_TYPES.find(r => r.id === previewId)?.title} — Generated {new Date().toLocaleDateString()}</p>
            {reportBody[previewId]}
          </div>
          <div className="flex justify-between mt-4">
            <button className="btn" onClick={() => setPreviewId(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}><Printer size={14} /> Print / Save as PDF</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
