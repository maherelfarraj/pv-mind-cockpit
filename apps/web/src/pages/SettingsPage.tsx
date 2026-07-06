import { useState } from 'react'
import { Settings, Database, Bell, Shield, Save } from 'lucide-react'

const NOTIFICATIONS = [
  { id: 'critical', label: 'Critical Alarms', description: 'Immediate notification for critical alarms' },
  { id: 'warning', label: 'Warning Alarms', description: 'Notification for warning severity alarms' },
  { id: 'workorders', label: 'Work Order Updates', description: 'Status changes on work orders' },
]

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [domain, setDomain] = useState('pvmind.ai')
  const [notifications, setNotifications] = useState<Record<string, boolean>>({ critical: true, warning: true, workorders: false })

  const toggle = (id: string) => setNotifications(p => ({ ...p, [id]: !p[id] }))
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Platform configuration and preferences</div>
        </div>
        <button className="btn btn-primary" onClick={save}>
          <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3"><Settings size={16} /><h4>General</h4></div>
          <div className="form-group">
            <label className="form-label">Application Domain</label>
            <input className="form-input" value={domain} onChange={e => setDomain(e.target.value)} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-3"><Database size={16} /><h4>Supabase</h4></div>
          <div className="form-group">
            <label className="form-label">Project URL</label>
            <input className="form-input" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} placeholder="https://xxx.supabase.co" />
          </div>
          <div className="form-group">
            <label className="form-label">Anon Key</label>
            <input className="form-input" type="password" value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)} placeholder="eyJh…" />
          </div>
          <span className={`badge ${supabaseUrl ? 'badge-success' : 'badge-neutral'}`}>{supabaseUrl ? 'Connected' : 'Not configured'}</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex items-center gap-2 mb-3"><Bell size={16} /><h4>Notifications</h4></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NOTIFICATIONS.map(n => (
              <label key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!notifications[n.id]} onChange={() => toggle(n.id)} style={{ marginTop: 3, accentColor: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{n.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-3"><Shield size={16} /><h4>Security</h4></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="kpi-card"><div className="kpi-label">Auth Provider</div><div style={{ fontWeight: 700 }}>Supabase</div><div className="kpi-sub">Email + OAuth</div></div>
            <div className="kpi-card"><div className="kpi-label">Row-Level Security</div><div style={{ fontWeight: 700, color: 'var(--success)' }}>Enabled</div><div className="kpi-sub">All tables protected</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
