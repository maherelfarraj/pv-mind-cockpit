import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store'
import type { WorkOrder } from '@pvmind/types'

export default function WorkOrdersPage() {
  const { workOrders, addWorkOrder, projects } = useStore()
  const [statusFilter, setStatusFilter] = useState<'all' | WorkOrder['status']>('all')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')

  const filtered = workOrders.filter(w => statusFilter === 'all' || w.status === statusFilter)
  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? id

  const createWO = () => {
    if (!title.trim()) return
    addWorkOrder({ id: `w${Date.now()}`, project_id: projectId, title: title.trim(), description: '', priority: 'medium', status: 'open', created_at: new Date().toISOString() })
    setTitle('')
    setShowForm(false)
  }

  const badgePriority = (p: WorkOrder['priority']) =>
    p === 'high' || p === 'critical' ? 'badge-danger' : p === 'medium' ? 'badge-warning' : 'badge-neutral'

  const badgeStatus = (s: WorkOrder['status']) =>
    s === 'open' ? 'badge-primary' : s === 'in_progress' ? 'badge-warning' : s === 'closed' ? 'badge-neutral' : 'badge-info'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Work Orders</div>
          <div className="page-subtitle">{workOrders.filter(w => w.status === 'open').length} open</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> New Work Order
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h4 className="mb-3">New Work Order</h4>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select className="form-select" value={projectId} onChange={e => setProjectId(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Work order title" onKeyDown={e => e.key === 'Enter' && createWO()} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={createWO}>Create</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} style={{ maxWidth: 200 }}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Title</th><th>Project</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600 }}>{w.title}</td>
                  <td style={{ color: 'var(--muted)' }}>{projectName(w.project_id)}</td>
                  <td><span className={`badge ${badgePriority(w.priority)}`}>{w.priority}</span></td>
                  <td><span className={`badge ${badgeStatus(w.status)}`}>{w.status}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No work orders match the filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
