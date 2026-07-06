import { useMemo, useState } from 'react'
import { useStore, PV_MODULES } from '../store'

export default function PVConfigurator() {
  const { activeProject } = useStore()
  const project = activeProject
  const [moduleId, setModuleId] = useState(PV_MODULES[0].id)
  const [strings, setStrings] = useState(200)
  const [modulesPerString, setModulesPerString] = useState(24)
  const [tilt, setTilt] = useState(20)
  const [azimuth, setAzimuth] = useState(180)
  const [saved, setSaved] = useState(false)

  const module = useMemo(() => PV_MODULES.find(m => m.id === moduleId) ?? PV_MODULES[0], [moduleId])

  const totals = useMemo(() => {
    const totalModules = strings * modulesPerString
    const totalCapacityKwp = (totalModules * module.power_wp) / 1000
    const areaM2 = totalModules * (module.dimensions.length / 1000) * (module.dimensions.width / 1000)
    return { totalModules, totalCapacityKwp, areaM2 }
  }, [strings, modulesPerString, module])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">PV Configurator</div>
          <div className="page-subtitle">{project?.name ?? 'No project selected'}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4 className="mb-3">Module Selection</h4>
          <div className="form-group">
            <label className="form-label">Module Model</label>
            <select className="form-select" value={moduleId} onChange={e => { setModuleId(e.target.value); setSaved(false) }}>
              {PV_MODULES.map(m => <option key={m.id} value={m.id}>{m.manufacturer} {m.model} ({m.power_wp}Wp)</option>)}
            </select>
          </div>
          <table className="table">
            <tbody>
              <tr><td>Voc</td><td>{module.voc} V</td></tr>
              <tr><td>Vmp</td><td>{module.vmp} V</td></tr>
              <tr><td>Isc</td><td>{module.isc} A</td></tr>
              <tr><td>Imp</td><td>{module.imp} A</td></tr>
              <tr><td>Efficiency</td><td>{module.efficiency}%</td></tr>
              <tr><td>Dimensions</td><td>{module.dimensions.length} × {module.dimensions.width} × {module.dimensions.height} mm</td></tr>
              <tr><td>Weight</td><td>{module.weight} kg</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h4 className="mb-3">Array Configuration</h4>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Number of Strings</label>
              <input className="form-input" type="number" value={strings} onChange={e => { setStrings(+e.target.value || 0); setSaved(false) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Modules / String</label>
              <input className="form-input" type="number" value={modulesPerString} onChange={e => { setModulesPerString(+e.target.value || 0); setSaved(false) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Tilt (°)</label>
              <input className="form-input" type="number" value={tilt} onChange={e => { setTilt(+e.target.value || 0); setSaved(false) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Azimuth (°)</label>
              <input className="form-input" type="number" value={azimuth} onChange={e => { setAzimuth(+e.target.value || 0); setSaved(false) }} />
            </div>
          </div>

          <div className="grid grid-3 mt-3">
            <div className="kpi-card">
              <div className="kpi-label">Total Modules</div>
              <div className="kpi-value">{totals.totalModules.toLocaleString()}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Capacity</div>
              <div className="kpi-value">{(totals.totalCapacityKwp / 1000).toFixed(2)} MWp</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Array Area</div>
              <div className="kpi-value">{totals.areaM2.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²</div>
            </div>
          </div>

          <button className="btn btn-primary mt-4" onClick={() => setSaved(true)}>Save Configuration</button>
          {saved && <span className="badge badge-success" style={{ marginLeft: 10 }}>Saved</span>}
        </div>
      </div>
    </div>
  )
}
