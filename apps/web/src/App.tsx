import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FleetKPIs from './pages/FleetKPIs'
import Projects from './pages/Projects'
import ProjectWizard from './pages/ProjectWizard'
import PVConfigurator from './pages/PVConfigurator'
import BESSConfigurator from './pages/BESSConfigurator'
import StringingMPPT from './pages/StringingMPPT'
import YieldEstimate from './pages/YieldEstimate'
import CAPEXEstimate from './pages/CAPEXEstimate'
import BOMPage from './pages/BOMPage'
import SLDPreview from './pages/SLDPreview'
import SimulationStudio from './pages/SimulationStudio'
import ReportsPage from './pages/ReportsPage'
import SCADAMonitor from './pages/SCADAMonitor'
import AlarmsPage from './pages/AlarmsPage'
import WorkOrdersPage from './pages/WorkOrdersPage'
import AnomaliesPage from './pages/AnomaliesPage'
import ExportLock from './pages/ExportLock'
import AdminSettings from './pages/AdminSettings'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fleet-kpis" element={<FleetKPIs />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectWizard />} />
            <Route path="/projects/:id/pv-config" element={<PVConfigurator />} />
            <Route path="/projects/:id/bess-config" element={<BESSConfigurator />} />
            <Route path="/projects/:id/stringing" element={<StringingMPPT />} />
            <Route path="/projects/:id/yield" element={<YieldEstimate />} />
            <Route path="/projects/:id/capex" element={<CAPEXEstimate />} />
            <Route path="/projects/:id/bom" element={<BOMPage />} />
            <Route path="/projects/:id/sld" element={<SLDPreview />} />
            <Route path="/projects/:id/simulation" element={<SimulationStudio />} />
            <Route path="/projects/:id/reports" element={<ReportsPage />} />
            <Route path="/scada" element={<SCADAMonitor />} />
            <Route path="/alarms" element={<AlarmsPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/anomalies" element={<AnomaliesPage />} />
            <Route path="/export-lock" element={<ExportLock />} />
            <Route path="/admin" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
