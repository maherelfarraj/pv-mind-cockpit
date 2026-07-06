import { useMemo, useState } from 'react'
import { useStore } from '../store'
import type { Alarm } from '@pvmind/types'

export default function AlarmsPage() {
  const { alarms, acknowledgeAlarm } = useStore()
  const [severityFilter, setSeverityFilter] = useState<'all' | Alarm['severity']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Alarm['status']>('all')

  const filtered = useMemo(() => alarms.filter(a =>
    (severityFilter === 'all' || a.severity === severityFilter) &&
    (statusFilter === 'all' || a.status === statusFilter)
  ), [alarms, severityFilter, statusFilter])

  const counts = useMemo(() => ({
    critical: alarms.filter(a => a.severity === 'critical' && a.status === 'active').length,
    warning: alarms.filter(a => a.severity === 'warning' && a.status === 'active').length,
  }), [alarms])

  const badgeClass = (severity: Alarm['severity']) =>
    severity === 'critical' ? 'badge-danger' : severity === 'warning' ? 'badge-warning' : 'badge-info'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Alarms</div>
          <div className="page-subtitle">Fleet-wide alarm monitoring</div>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-danger">{counts.critical} Critical</span>
          <span className="badge badge-warning">{counts.warning} Warning</span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="grid grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Severity</label>
            <select className="form-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value as typeof severityFilter)}>
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Message</th>
                <th>Triggered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td><span className={`badge ${badgeClass(a.severity)}`}>{a.severity}</span></td>
                  <td>{a.message}</td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(a.triggered_at).toLocaleString()}</td>
                  <td><span className={`badge ${a.status === 'active' ? 'badge-danger' : 'badge-neutral'}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'active' && (
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => acknowledgeAlarm(a.id)}>
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No alarms match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
