import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Gauge, FolderKanban, Radio, BellRing, ClipboardList,
  Sparkles, Lock, Settings, Sun, Bell, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useStore } from '../store'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/fleet-kpis', label: 'Fleet KPIs', icon: Gauge },
  { path: '/projects', label: 'Projects', icon: FolderKanban, hasSub: true },
  { path: '/scada', label: 'SCADA Monitor', icon: Radio },
  { path: '/alarms', label: 'Alarms', icon: BellRing },
  { path: '/work-orders', label: 'Work Orders', icon: ClipboardList },
  { path: '/anomalies', label: 'Anomalies', icon: Sparkles },
  { path: '/export-lock', label: 'Export Lock', icon: Lock },
  { path: '/admin', label: 'Admin Settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, activeProjectId, setActiveProjectId, alarms } = useStore()
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const activeAlarmCount = alarms.filter(a => a.status === 'active').length
  const domain = import.meta.env.VITE_APP_DOMAIN || 'pvmind.ai'

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
            const isActive = location.pathname === item.path || (item.hasSub && location.pathname.startsWith('/projects'))
            return (
              <div key={item.path}>
                <div
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (item.hasSub) {
                      setProjectsExpanded(v => !v)
                    }
                    navigate(item.path)
                  }}
                >
                  <Icon size={17} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.hasSub && (projectsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </div>
                {item.hasSub && projectsExpanded && (
                  <div className="sidebar-sublinks">
                    {projects.map(p => (
                      <div
                        key={p.id}
                        className={`sidebar-sublink ${activeProjectId === p.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveProjectId(p.id)
                          navigate(`/projects/${p.id}/pv-config`)
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                    <div
                      className="sidebar-sublink"
                      style={{ color: 'var(--primary)' }}
                      onClick={(e) => { e.stopPropagation(); navigate('/projects/new') }}
                    >
                      + New Project
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <span style={{ fontWeight: 700, fontSize: 15 }}>PV Mind Cockpit</span>
            <span className="domain-badge">{domain}</span>
          </div>
          <div className="topbar-right">
            <div style={{ position: 'relative' }}>
              <Bell size={19} onClick={() => navigate('/alarms')} style={{ cursor: 'pointer' }} />
              {activeAlarmCount > 0 && (
                <span
                  style={{
                    position: 'absolute', top: -6, right: -8, background: 'var(--danger)',
                    color: 'white', borderRadius: '999px', fontSize: 10, fontWeight: 700,
                    padding: '1px 5px', lineHeight: '12px',
                  }}
                >
                  {activeAlarmCount}
                </span>
              )}
            </div>
            <div className="avatar">JD</div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
