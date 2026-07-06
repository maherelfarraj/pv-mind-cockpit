import { useNavigate } from 'react-router-dom'
import { Plus, ExternalLink, Settings, Download } from 'lucide-react'
import { useStore } from '../store'

export default function Projects() {
  const { projects, setActiveProjectId } = useStore()
  const navigate = useNavigate()

  const openProject = (id: string) => {
    setActiveProjectId(id)
    navigate(`/projects/${id}/yield`)
  }

  const configureProject = (id: string) => {
    setActiveProjectId(id)
    navigate(`/projects/${id}/pv-config`)
  }

  const exportProject = (id: string) => {
    setActiveProjectId(id)
    navigate('/export-lock')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">All PV and PV+BESS projects in your portfolio</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
          <Plus size={15} /> New Project
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.type === 'pv-bess' ? 'PV + BESS' : 'PV Only'}</td>
                <td>
                  {(p.capacity_kwp / 1000).toFixed(1)} MWp
                  {p.bess_capacity_kwh ? ` / ${(p.bess_capacity_kwh / 1000).toFixed(1)} MWh` : ''}
                </td>
                <td>{p.location.timezone}</td>
                <td>
                  <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'draft' ? 'badge-neutral' : 'badge-info'}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.created_at}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm" onClick={() => openProject(p.id)}><ExternalLink size={12} /> Open</button>
                    <button className="btn btn-sm" onClick={() => configureProject(p.id)}><Settings size={12} /> Configure</button>
                    <button className="btn btn-sm" onClick={() => exportProject(p.id)}><Download size={12} /> Export</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
