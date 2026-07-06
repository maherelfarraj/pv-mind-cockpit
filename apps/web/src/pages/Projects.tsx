import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store'
import type { Project } from '@pvmind/types'

export default function Projects() {
  const { projects, addProject, activeProjectId, setActiveProjectId } = useStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const createProject = () => {
    if (!name.trim()) return
    const p: Project = {
      id: `p${Date.now()}`, name: name.trim(), type: 'pv', status: 'draft',
      location: { lat: 25.0, lon: 55.0, timezone: 'Asia/Dubai' },
      capacity_kwp: 1000, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    addProject(p)
    setName('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in portfolio</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> New Project
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h4 className="mb-3">New Project</h4>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Solar Farm Delta" onKeyDown={e => e.key === 'Enter' && createProject()} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={createProject}>Create</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <input className="form-input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-3">
        {filtered.map(p => (
          <div key={p.id} className={`card ${activeProjectId === p.id ? 'active' : ''}`} style={{ cursor: 'pointer', borderColor: activeProjectId === p.id ? 'var(--primary)' : undefined }} onClick={() => setActiveProjectId(p.id)}>
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              <span className={`badge badge-${p.status === 'active' ? 'success' : p.status === 'draft' ? 'neutral' : 'primary'}`}>{p.status}</span>
            </div>
            <div className="kpi-label">DC Capacity</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{(p.capacity_kwp / 1000).toFixed(1)} MWp</div>
            {p.bess_capacity_kwh && <div style={{ fontSize: 13, color: 'var(--muted)' }}>BESS: {p.bess_capacity_kwh / 1000} MWh</div>}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>{p.location.timezone} · {p.location.lat.toFixed(1)}°N, {p.location.lon.toFixed(1)}°E</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No projects match your search.</div>
      )}
    </div>
  )
}
