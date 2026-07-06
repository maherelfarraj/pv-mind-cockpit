import { useMemo } from 'react'
import { useStore } from '../store'
import { calcFleetKPIs } from '@pvmind/shared'

export default function AnomaliesPage() {
  const { anomalies, projects, dismissAnomaly } = useStore()
  const kpis = useMemo(() => calcFleetKPIs(projects), [projects])
  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? id

  const confidenceColor = (c: number) => c >= 80 ? 'var(--success)' : c >= 60 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Anomalies &amp; RCA</div>
          <div className="page-subtitle">AI-assisted anomaly detection and root-cause analysis</div>
        </div>
        <div className="kpi-card" style={{ minWidth: 180 }}>
          <div className="kpi-label">Fleet Health Score</div>
          <div className="kpi-value">{kpis.health_score}%</div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Type</th><th>Description</th><th>RCA Suggestion</th><th>Project</th><th>Confidence</th><th>Detected</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {anomalies.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{a.type}</td>
                <td style={{ maxWidth: 220 }}>{a.description}</td>
                <td style={{ maxWidth: 280 }} className="text-muted">{a.rca}</td>
                <td>{projectName(a.project_id)}</td>
                <td style={{ minWidth: 100 }}>
                  <div className="progress-bar mb-2">
                    <div className="progress-bar-fill" style={{ width: `${a.confidence}%`, background: confidenceColor(a.confidence) }} />
                  </div>
                  <span className="text-sm">{a.confidence}%</span>
                </td>
                <td>{new Date(a.detected_at).toLocaleDateString()}</td>
                <td><button className="btn btn-sm" onClick={() => dismissAnomaly(a.id)}>Dismiss</button></td>
              </tr>
            ))}
            {anomalies.length === 0 && (
              <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>All anomalies have been reviewed and dismissed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
