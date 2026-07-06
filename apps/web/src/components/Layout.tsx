import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Radio, BellRing, ClipboardList, Settings, Sun } from 'lucide-react'
import { useStore } from '../store'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/scada', label: 'SCADA Monitor', icon: Radio },
  { path: '/alarms', label: 'Alarms', icon: BellRing },
  { path: '/work-orders', label: 'Work Orders', icon: ClipboardList },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { alarms } = useStore()
  const activeAlarmCount = alarms.filter(a => a.status === 'active').length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Sun size={22} color="var(--primary)" />
          <span>PV Mind Cockpit</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <div
                key={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.path === '/alarms' && activeAlarmCount > 0 && (
                  <span className="badge badge-danger">{activeAlarmCount}</span>
                )}
              </div>
            )
          })}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)' }}>
          pvmind.ai &copy; {new Date().getFullYear()}
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
