import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { Alarm } from '@pvmind/shared'

export default function AlarmsPage() {
  const { alarms, projects, acknowledgeAlarm } = useStore()
  const navigate = useNavigate()
  const [severityFilter, setSeverityFilter] = useState<'all' | Alarm['severity']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Alarm['status']>('all')

  const filtered = useMemo(() => alarms.filter(a =>
    (severityFilter === 'all' || a.severity === severityFilter) &&
    (statusFilter === 'all' || a.status === statusFilter)
  ), [alarms, severityFilter, statusFilter])

  const counts = useMemo(() => ({
    critical: alarms.filter(a => a.severity === 'critical' && a.status === 'active').length,
    warning: alarms.filter(a => a.severity === 'warning' && a.status === 'active').length,
    info: alarms.filter(a => a.severity === 'info' && a.status === 'active').length,
  }), [alarms])

  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? id

  const createWorkOrder = (alarm: Alarm) => {
    navigate('/work-orders', { state: { fromAlarm: alarm } })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Alarms</div>
          <div className="page-subtitle">Fleet-wide alarm monitoring and acknowledgement</div>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-danger">{counts.critical} Critical</span>
          <span className="badge badge-warning">{counts.warning} Warning</span>
          <span className="badge badge-info">{counts.info} Info</span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Severity</label>
            <select className="form-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value as typeof severityFilter)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Severity</th><th>Message</th><th>Project</th><th>Triggered At</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td><span className={`badge ${a.severity === 'critical' ? 'badge-danger' : a.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>{a.severity}</span></td>
                <td>{a.message}</td>
                <td>{projectName(a.project_id)}</td>
                <td>{new Date(a.triggered_at).toLocaleString()}</td>
                <td><span className={`badge ${a.status === 'active' ? 'badge-danger' : 'badge-success'}`}>{a.status}</span></td>
                <td>
                  <div className="flex gap-2">
                    {a.status === 'active' && (
                      <button className="btn btn-sm" onClick={() => acknowledgeAlarm(a.id)}>Acknowledge</button>
                    )}
                    <button className="btn btn-sm btn-secondary" onClick={() => createWorkOrder(a)}>Create Work Order</button>
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
