import { useMemo, useState } from 'react'
import { validateStringing } from '@pvmind/shared'
import { useStore, PV_MODULES, INVERTERS } from '../store'

export default function StringingMPPT() {
  const { activeProject } = useStore()
  const [inverterId, setInverterId] = useState(INVERTERS[0].id)
  const [moduleId, setModuleId] = useState(PV_MODULES[0].id)
  const [modulesPerString, setModulesPerString] = useState(24)
  const [stringsPerMppt, setStringsPerMppt] = useState(2)

  const inverter = useMemo(() => INVERTERS.find(i => i.id === inverterId) ?? INVERTERS[0], [inverterId])
  const module = useMemo(() => PV_MODULES.find(m => m.id === moduleId) ?? PV_MODULES[0], [moduleId])

  const mpptResults = useMemo(() => {
    return Array.from({ length: inverter.mppt_count }, (_, i) => {
      const result = validateStringing(module, inverter, modulesPerString, stringsPerMppt)
      return { mppt: i + 1, ...result }
    })
  }, [inverter, module, modulesPerString, stringsPerMppt])

  const allValid = mpptResults.every(r => r.valid)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Stringing &amp; MPPT Validation</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
        <span className={`badge ${allValid ? 'badge-success' : 'badge-danger'}`}>{allValid ? 'All MPPTs Valid' : 'Errors Detected'}</span>
      </div>

      <div className="card mb-4">
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">Inverter</label>
            <select className="form-select" value={inverterId} onChange={e => setInverterId(e.target.value)}>
              {INVERTERS.map(inv => <option key={inv.id} value={inv.id}>{inv.manufacturer} {inv.model}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Module</label>
            <select className="form-select" value={moduleId} onChange={e => setModuleId(e.target.value)}>
              {PV_MODULES.map(m => <option key={m.id} value={m.id}>{m.manufacturer} {m.model}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Modules / String</label>
            <input className="form-input" type="number" value={modulesPerString} onChange={e => setModulesPerString(+e.target.value || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Strings / MPPT</label>
            <input className="form-input" type="number" value={stringsPerMppt} onChange={e => setStringsPerMppt(+e.target.value || 0)} />
          </div>
        </div>
        <table className="table mt-3">
          <tbody>
            <tr><td>MPPT Voltage Range</td><td>{inverter.mppt_voltage_min}V – {inverter.mppt_voltage_max}V</td></tr>
            <tr><td>Max Current per MPPT</td><td>{inverter.max_input_current_per_mppt}A</td></tr>
            <tr><td>MPPT Count</td><td>{inverter.mppt_count}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h4 className="mb-3">Per-MPPT Validation</h4>
        <table className="table">
          <thead>
            <tr><th>MPPT</th><th>Voc String</th><th>Vmp String</th><th>Isc Total</th><th>Result</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {mpptResults.map(r => (
              <tr key={r.mppt}>
                <td>MPPT-{r.mppt}</td>
                <td>{r.voc_string.toFixed(1)} V</td>
                <td>{r.vmp_string.toFixed(1)} V</td>
                <td>{r.isc_total.toFixed(1)} A</td>
                <td>
                  <span className={`badge ${r.errors.length ? 'badge-danger' : r.warnings.length ? 'badge-warning' : 'badge-success'}`}>
                    {r.errors.length ? 'Fail' : r.warnings.length ? 'Warning' : 'Pass'}
                  </span>
                </td>
                <td>
                  {r.errors.map((e, i) => <div key={i} style={{ color: 'var(--danger)' }}>{e}</div>)}
                  {r.warnings.map((w, i) => <div key={i} style={{ color: 'var(--warning)' }}>{w}</div>)}
                  {!r.errors.length && !r.warnings.length && <span className="text-muted">Within limits</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
