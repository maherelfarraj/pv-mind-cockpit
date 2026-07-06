import { useState } from 'react'
import { Settings, Database, Bell, Shield, Users, Save, RefreshCw } from 'lucide-react'
import { useStore } from '../store'

const NOTIFICATION_OPTIONS = [
  { id: 'critical_alarms', label: 'Critical Alarms', description: 'Immediate notification for critical severity alarms' },
  { id: 'warning_alarms', label: 'Warning Alarms', description: 'Notification for warning severity alarms' },
  { id: 'work_order_updates', label: 'Work Order Updates', description: 'Status changes on assigned work orders' },
  { id: 'anomaly_detected', label: 'Anomaly Detection', description: 'New AI-detected anomalies across the fleet' },
  { id: 'export_lock_changes', label: 'Export Lock Changes', description: 'Changes to project export lock status' },
]

const DATA_RETENTION_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: '730', label: '2 years' },
]

export default function AdminSettings() {
  const { projects } = useStore()
  const [saved, setSaved] = useState(false)

  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? '')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '')
  const [domain, setDomain] = useState(import.meta.env.VITE_APP_DOMAIN ?? 'pvmind.ai')
  const [dataRetention, setDataRetention] = useState('365')
  const [scadaPollInterval, setScadaPollInterval] = useState('5')
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    critical_alarms: true,
    warning_alarms: true,
    work_order_updates: false,
    anomaly_detected: true,
    export_lock_changes: false,
  })

  const toggleNotification = (id: string) =>
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Admin Settings</div>
          <div className="page-subtitle">Platform configuration, integrations, and system preferences</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><RefreshCw size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-2 mb-4">
        {/* Platform Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} />
            <h4>Platform Info</h4>
          </div>
          <div className="form-group">
            <label className="form-label">Application Domain</label>
            <input
              className="form-input"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="pvmind.ai"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Total Projects</label>
            <input className="form-input" value={projects.length} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">SCADA Poll Interval (seconds)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="60"
              value={scadaPollInterval}
              onChange={e => setScadaPollInterval(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">SCADA Data Retention</label>
            <select
              className="form-select"
              value={dataRetention}
              onChange={e => setDataRetention(e.target.value)}
            >
              {DATA_RETENTION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Supabase Integration */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} />
            <h4>Supabase Integration</h4>
          </div>
          <div className="form-group">
            <label className="form-label">Project URL</label>
            <input
              className="form-input"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Anon / Public Key</label>
            <input
              className="form-input"
              type="password"
              value={supabaseAnonKey}
              onChange={e => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJh..."
            />
          </div>
          <div className={`badge ${supabaseUrl ? 'badge-success' : 'badge-neutral'} mt-2`}>
            {supabaseUrl ? 'Connected' : 'Not configured'}
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} />
            <h4>Notification Preferences</h4>
          </div>
          <div className="flex flex-col gap-2" style={{ gap: '12px' }}>
            {NOTIFICATION_OPTIONS.map(opt => (
              <label key={opt.id} className="flex items-start gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!notifications[opt.id]}
                  onChange={() => toggleNotification(opt.id)}
                  style={{ marginTop: 3, accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security & Access */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} />
            <h4>Security &amp; Access</h4>
          </div>
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div className="kpi-card">
              <div className="kpi-label">Session Timeout</div>
              <div className="kpi-value">30 min</div>
              <div className="kpi-sub">Idle session auto-logout</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Auth Provider</div>
              <div className="kpi-value">Supabase</div>
              <div className="kpi-sub">Email + OAuth (Google / GitHub)</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Row-Level Security</div>
              <div className="kpi-value" style={{ color: 'var(--success)' }}>Enabled</div>
              <div className="kpi-sub">All tables protected by RLS policies</div>
            </div>
          </div>
        </div>
      </div>

      {/* User & Roles placeholder */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} />
          <h4>Users &amp; Roles</h4>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>admin@pvmind.ai</td>
                <td><span className="badge badge-primary">Admin</span></td>
                <td>Just now</td>
                <td><span className="badge badge-success">Active</span></td>
              </tr>
              <tr>
                <td>engineer@pvmind.ai</td>
                <td><span className="badge badge-neutral">Engineer</span></td>
                <td>2 days ago</td>
                <td><span className="badge badge-success">Active</span></td>
              </tr>
              <tr>
                <td>viewer@pvmind.ai</td>
                <td><span className="badge badge-neutral">Viewer</span></td>
                <td>1 week ago</td>
                <td><span className="badge badge-neutral">Inactive</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
