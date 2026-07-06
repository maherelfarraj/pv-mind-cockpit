import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, BatteryCharging, Check } from 'lucide-react'
import { useStore } from '../store'
import { PV_MODULES } from '../store'
import type { Project } from '@pvmind/shared'

type WizardData = {
  type: 'pv' | 'pv-bess'
  name: string
  lat: string
  lon: string
  timezone: string
  capacity_kwp: string
  module_id: string
  tilt: string
  azimuth: string
  bess_capacity_kwh: string
  bess_power_kw: string
  chemistry: 'LFP' | 'NMC' | 'NCA'
}

const INITIAL: WizardData = {
  type: 'pv',
  name: '',
  lat: '25.2',
  lon: '55.3',
  timezone: 'Asia/Dubai',
  capacity_kwp: '5000',
  module_id: PV_MODULES[0].id,
  tilt: '20',
  azimuth: '180',
  bess_capacity_kwh: '10000',
  bess_power_kw: '5000',
  chemistry: 'LFP',
}

export default function ProjectWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(INITIAL)
  const { addProject } = useStore()
  const navigate = useNavigate()

  const steps = data.type === 'pv-bess'
    ? ['Type', 'Location', 'PV Config', 'BESS Config', 'Review']
    : ['Type', 'Location', 'PV Config', 'Review']

  const update = (patch: Partial<WizardData>) => setData(prev => ({ ...prev, ...patch }))

  const createProject = () => {
    const now = new Date().toISOString().slice(0, 10)
    const project: Project = {
      id: `p${Date.now()}`,
      name: data.name || 'Untitled Project',
      type: data.type,
      location: { lat: parseFloat(data.lat) || 0, lon: parseFloat(data.lon) || 0, timezone: data.timezone || 'UTC' },
      capacity_kwp: parseFloat(data.capacity_kwp) || 1000,
      bess_capacity_kwh: data.type === 'pv-bess' ? (parseFloat(data.bess_capacity_kwh) || 0) : undefined,
      status: 'draft',
      created_at: now,
      updated_at: now,
    }
    addProject(project)
    navigate('/projects')
  }

  const isLastStep = step === steps.length - 1
  const isBessStep = data.type === 'pv-bess' && steps[step] === 'BESS Config'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">New Project</div>
          <div className="page-subtitle">Step {step + 1} of {steps.length}: {steps[step]}</div>
        </div>
      </div>

      <div className="tab-bar">
        {steps.map((s, i) => (
          <div key={s} className={`tab ${i === step ? 'active' : ''}`} onClick={() => setStep(i)}>{s}</div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {steps[step] === 'Type' && (
          <div className="grid grid-2">
            <div
              className="card"
              style={{ cursor: 'pointer', borderColor: data.type === 'pv' ? 'var(--primary)' : 'var(--border)', textAlign: 'center', padding: 32 }}
              onClick={() => update({ type: 'pv' })}
            >
              <Sun size={36} color="var(--primary)" />
              <h3 className="mt-3">PV Only</h3>
              <p className="text-muted text-sm mt-2">Standalone solar PV generation asset without storage.</p>
              {data.type === 'pv' && <div className="mt-3"><Check size={16} color="var(--success)" /></div>}
            </div>
            <div
              className="card"
              style={{ cursor: 'pointer', borderColor: data.type === 'pv-bess' ? 'var(--primary)' : 'var(--border)', textAlign: 'center', padding: 32 }}
              onClick={() => update({ type: 'pv-bess' })}
            >
              <BatteryCharging size={36} color="var(--primary)" />
              <h3 className="mt-3">PV + BESS</h3>
              <p className="text-muted text-sm mt-2">Solar PV coupled with battery energy storage system.</p>
              {data.type === 'pv-bess' && <div className="mt-3"><Check size={16} color="var(--success)" /></div>}
            </div>
          </div>
        )}

        {steps[step] === 'Location' && (
          <div>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-input" value={data.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Sunrise Solar Park" />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" value={data.lat} onChange={e => update({ lat: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" value={data.lon} onChange={e => update({ lon: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <input className="form-input" value={data.timezone} onChange={e => update({ timezone: e.target.value })} placeholder="e.g. Asia/Dubai" />
            </div>
          </div>
        )}

        {steps[step] === 'PV Config' && (
          <div>
            <div className="form-group">
              <label className="form-label">Capacity (kWp)</label>
              <input className="form-input" type="number" value={data.capacity_kwp} onChange={e => update({ capacity_kwp: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Module Model</label>
              <select className="form-select" value={data.module_id} onChange={e => update({ module_id: e.target.value })}>
                {PV_MODULES.map(m => <option key={m.id} value={m.id}>{m.manufacturer} {m.model} ({m.power_wp}Wp)</option>)}
              </select>
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Tilt (°)</label>
                <input className="form-input" type="number" value={data.tilt} onChange={e => update({ tilt: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Azimuth (°)</label>
                <input className="form-input" type="number" value={data.azimuth} onChange={e => update({ azimuth: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {isBessStep && (
          <div>
            <div className="form-group">
              <label className="form-label">BESS Capacity (kWh)</label>
              <input className="form-input" type="number" value={data.bess_capacity_kwh} onChange={e => update({ bess_capacity_kwh: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">BESS Power (kW)</label>
              <input className="form-input" type="number" value={data.bess_power_kw} onChange={e => update({ bess_power_kw: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Chemistry</label>
              <select className="form-select" value={data.chemistry} onChange={e => update({ chemistry: e.target.value as WizardData['chemistry'] })}>
                <option value="LFP">LFP</option>
                <option value="NMC">NMC</option>
                <option value="NCA">NCA</option>
              </select>
            </div>
          </div>
        )}

        {steps[step] === 'Review' && (
          <div>
            <table className="table">
              <tbody>
                <tr><td>Type</td><td>{data.type === 'pv-bess' ? 'PV + BESS' : 'PV Only'}</td></tr>
                <tr><td>Name</td><td>{data.name || 'Untitled Project'}</td></tr>
                <tr><td>Location</td><td>{data.lat}, {data.lon} ({data.timezone})</td></tr>
                <tr><td>Capacity</td><td>{data.capacity_kwp} kWp</td></tr>
                <tr><td>Module</td><td>{PV_MODULES.find(m => m.id === data.module_id)?.model}</td></tr>
                <tr><td>Tilt / Azimuth</td><td>{data.tilt}° / {data.azimuth}°</td></tr>
                {data.type === 'pv-bess' && (
                  <>
                    <tr><td>BESS Capacity</td><td>{data.bess_capacity_kwh} kWh</td></tr>
                    <tr><td>BESS Power</td><td>{data.bess_power_kw} kW</td></tr>
                    <tr><td>Chemistry</td><td>{data.chemistry}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button className="btn" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>Back</button>
          {isLastStep ? (
            <button className="btn btn-primary" onClick={createProject}>Create Project</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>Next</button>
          )}
        </div>
      </div>
    </div>
  )
}
