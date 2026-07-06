import { useMemo, useState } from 'react'
import { useStore, BESS_UNITS } from '../store'

type Mode = 'self-consumption' | 'peak-shaving' | 'arbitrage'

const SCHEDULE: Record<Mode, { hour: string; action: string }[]> = {
  'self-consumption': [
    { hour: '00:00 - 06:00', action: 'Idle / standby' },
    { hour: '06:00 - 10:00', action: 'Charge from excess PV' },
    { hour: '10:00 - 16:00', action: 'Charge (peak solar)' },
    { hour: '16:00 - 22:00', action: 'Discharge to load' },
    { hour: '22:00 - 24:00', action: 'Idle / standby' },
  ],
  'peak-shaving': [
    { hour: '00:00 - 07:00', action: 'Charge (off-peak grid)' },
    { hour: '07:00 - 11:00', action: 'Standby' },
    { hour: '11:00 - 14:00', action: 'Discharge (midday peak)' },
    { hour: '14:00 - 18:00', action: 'Charge from PV surplus' },
    { hour: '18:00 - 22:00', action: 'Discharge (evening peak)' },
  ],
  arbitrage: [
    { hour: '00:00 - 05:00', action: 'Charge (low price)' },
    { hour: '05:00 - 09:00', action: 'Standby' },
    { hour: '09:00 - 17:00', action: 'Charge from PV' },
    { hour: '17:00 - 21:00', action: 'Discharge (high price)' },
    { hour: '21:00 - 24:00', action: 'Standby' },
  ],
}

export default function BESSConfigurator() {
  const { activeProject } = useStore()
  const [unitId, setUnitId] = useState(BESS_UNITS[0].id)
  const [numUnits, setNumUnits] = useState(40)
  const [mode, setMode] = useState<Mode>('self-consumption')
  const [saved, setSaved] = useState(false)

  const unit = useMemo(() => BESS_UNITS.find(u => u.id === unitId) ?? BESS_UNITS[0], [unitId])

  const totals = useMemo(() => ({
    capacity_kwh: unit.capacity_kwh * numUnits,
    power_kw: unit.power_kw * numUnits,
  }), [unit, numUnits])

  if (activeProject?.type !== 'pv-bess') {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">BESS Configurator</div>
            <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
          </div>
        </div>
        <div className="card">
          <p>This project is configured as PV-only. Switch the active project to a PV+BESS project (e.g. Desert Sun Beta) via the sidebar to configure a storage system, or create a new PV+BESS project.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">BESS Configurator</div>
          <div className="page-subtitle">{activeProject.name}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4 className="mb-3">Battery Unit Selection</h4>
          <div className="form-group">
            <label className="form-label">BESS Unit</label>
            <select className="form-select" value={unitId} onChange={e => { setUnitId(e.target.value); setSaved(false) }}>
              {BESS_UNITS.map(u => <option key={u.id} value={u.id}>{u.manufacturer} {u.model} ({u.capacity_kwh}kWh)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Number of Units</label>
            <input className="form-input" type="number" value={numUnits} onChange={e => { setNumUnits(+e.target.value || 0); setSaved(false) }} />
          </div>
          <table className="table">
            <tbody>
              <tr><td>Chemistry</td><td>{unit.chemistry}</td></tr>
              <tr><td>DoD</td><td>{unit.dod}%</td></tr>
              <tr><td>Round-trip Efficiency</td><td>{unit.round_trip_efficiency}%</td></tr>
              <tr><td>Voltage</td><td>{unit.voltage_v} V</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h4 className="mb-3">Operating Mode</h4>
          <div className="form-group">
            <label className="form-label">Mode</label>
            <select className="form-select" value={mode} onChange={e => { setMode(e.target.value as Mode); setSaved(false) }}>
              <option value="self-consumption">Self-consumption</option>
              <option value="peak-shaving">Peak-shaving</option>
              <option value="arbitrage">Arbitrage</option>
            </select>
          </div>

          <div className="grid grid-2 mb-3">
            <div className="kpi-card">
              <div className="kpi-label">Total Capacity</div>
              <div className="kpi-value">{(totals.capacity_kwh / 1000).toFixed(1)} MWh</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Power</div>
              <div className="kpi-value">{(totals.power_kw / 1000).toFixed(1)} MW</div>
            </div>
          </div>

          <h4 className="mb-2 text-sm">Charge / Discharge Schedule</h4>
          <table className="table">
            <thead><tr><th>Time Window</th><th>Action</th></tr></thead>
            <tbody>
              {SCHEDULE[mode].map(row => (
                <tr key={row.hour}><td>{row.hour}</td><td>{row.action}</td></tr>
              ))}
            </tbody>
          </table>

          <button className="btn btn-primary mt-4" onClick={() => setSaved(true)}>Save Configuration</button>
          {saved && <span className="badge badge-success" style={{ marginLeft: 10 }}>Saved</span>}
        </div>
      </div>
    </div>
  )
}
