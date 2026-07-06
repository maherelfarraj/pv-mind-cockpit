import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '../store'
import Modal from '../components/Modal'
import type { WorkOrder, Alarm } from '@pvmind/shared'

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'medium' as WorkOrder['priority'],
  project_id: '',
  assigned_to: '',
  due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
}

export default function WorkOrdersPage() {
  const { workOrders, projects, addWorkOrder, updateWorkOrder } = useStore()
  const location = useLocation()
  const [statusFilter, setStatusFilter] = useState<'all' | WorkOrder['status']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | WorkOrder['priority']>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    const state = location.state as { fromAlarm?: Alarm } | null
    if (state?.fromAlarm) {
      setForm({
        title: `Investigate: ${state.fromAlarm.message}`,
        description: `Auto-generated from alarm triggered at ${new Date(state.fromAlarm.triggered_at).toLocaleString()}.`,
        priority: state.fromAlarm.severity === 'critical' ? 'high' : state.fromAlarm.severity === 'warning' ? 'medium' : 'low',
        project_id: state.fromAlarm.project_id,
        assigned_to: '',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      })
      setEditingId(null)
      setShowModal(true)
    }
  }, [location.state])

  const filtered = useMemo(() => workOrders.filter(w =>
    (statusFilter === 'all' || w.status === statusFilter) &&
    (priorityFilter === 'all' || w.priority === priorityFilter)
  ), [workOrders, statusFilter, priorityFilter])

  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? id

  const openNew = () => {
    setForm({ ...EMPTY_FORM, project_id: projects[0]?.id ?? '' })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (w: WorkOrder) => {
    setForm({ title: w.title, description: w.description, priority: w.priority, project_id: w.project_id, assigned_to: w.assigned_to ?? '', due_date: w.due_date })
    setEditingId(w.id)
    setShowModal(true)
  }

  const saveForm = () => {
    if (editingId) {
      updateWorkOrder(editingId, { ...form })
    } else {
      const wo: WorkOrder = {
        id: `w${Date.now()}`,
        project_id: form.project_id || projects[0]?.id || '',
        title: form.title || 'Untitled Work Order',
        description: form.description,
        priority: form.priority,
        status: 'open',
        assigned_to: form.assigned_to || undefined,
        created_at: new Date().toISOString().slice(0, 10),
        due_date: form.due_date,
      }
      addWorkOrder(wo)
    }
    setShowModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Work Orders</div>
          <div className="page-subtitle">Maintenance and field service tracking</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> New Work Order</button>
      </div>

      <div className="card mb-4">
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as typeof priorityFilter)}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Priority</th><th>Status</th><th>Project</th><th>Assigned To</th><th>Due Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id}>
                <td>{w.title}</td>
                <td><span className={`badge ${w.priority === 'high' ? 'badge-danger' : w.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>{w.priority}</span></td>
                <td><span className={`badge ${w.status === 'closed' ? 'badge-success' : w.status === 'in_progress' ? 'badge-info' : 'badge-neutral'}`}>{w.status.replace('_', ' ')}</span></td>
                <td>{projectName(w.project_id)}</td>
                <td>{w.assigned_to ?? '—'}</td>
                <td>{w.due_date}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm" onClick={() => openEdit(w)}>Edit</button>
                    {w.status !== 'closed' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => updateWorkOrder(w.id, { status: 'closed' })}>Close</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Work Order' : 'New Work Order'} onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as WorkOrder['priority'] })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project</label>
              <select className="form-select" value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input className="form-input" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveForm}>{editingId ? 'Save Changes' : 'Create Work Order'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
