import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import SCADAMonitor from './pages/SCADAMonitor'
import AlarmsPage from './pages/AlarmsPage'
import WorkOrdersPage from './pages/WorkOrdersPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/scada" element={<SCADAMonitor />} />
            <Route path="/alarms" element={<AlarmsPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
