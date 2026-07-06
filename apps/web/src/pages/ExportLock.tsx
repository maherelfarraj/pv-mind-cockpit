import { useState } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import { useStore } from '../store'
import Modal from '../components/Modal'

interface ExportHistoryEntry {
  id: string
  project: string
  format: string
  date: string
}

const HISTORY: ExportHistoryEntry[] = [
  { id: 'e1', project: 'Solar Farm Alpha', format: 'PDF', date: '2024-06-10' },
  { id: 'e2', project: 'Desert Sun Beta', format: 'DXF', date: '2024-06-05' },
  { id: 'e3', project: 'Solar Farm Alpha', format: 'CSV', date: '2024-05-28' },
]

const FORMATS = ['PDF', 'DXF', 'IFC', 'CSV']

export default function ExportLock() {
  const { projects, exportLocks, toggleExportLock } = useStore()
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['PDF'])

  const toggleFormat = (f: string) => {
    setSelectedFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const downloadPackage = () => {
    const project = projects.find(p => p.id === exportingId)
    const content = `Export Package for ${project?.name}\nFormats: ${selectedFormats.join(', ')}\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.name ?? 'project'}-export-package.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExportingId(null)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Export Lock</div>
          <div className="page-subtitle">Control which projects can be exported and to what formats</div>
        </div>
      </div>

      <div className="card mb-4">
        <table className="table">
          <thead>
            <tr><th>Project</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const locked = !!exportLocks[p.id]
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    {locked ? (
                      <span className="badge badge-danger"><Lock size={11} /> Locked</span>
                    ) : (
                      <span className="badge badge-success"><Unlock size={11} /> Unlocked</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => toggleExportLock(p.id)}>
                        {locked ? 'Unlock' : 'Lock'}
                      </button>
                      <button className="btn btn-sm btn-primary" disabled={locked} onClick={() => { setExportingId(p.id); setSelectedFormats(['PDF']) }}>
                        <Download size={12} /> Export Package
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h4 className="mb-3">Export History</h4>
        <table className="table">
          <thead><tr><th>Project</th><th>Format</th><th>Date</th></tr></thead>
          <tbody>
            {HISTORY.map(h => (
              <tr key={h.id}><td>{h.project}</td><td><span className="badge badge-info">{h.format}</span></td><td>{h.date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {exportingId && (
        <Modal title="Export Package" onClose={() => setExportingId(null)}>
          <p className="mb-3">Select formats to include for <strong>{projects.find(p => p.id === exportingId)?.name}</strong>:</p>
          <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
            {FORMATS.map(f => (
              <span
                key={f}
                className={`badge ${selectedFormats.includes(f) ? 'badge-info' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 12 }}
                onClick={() => toggleFormat(f)}
              >
                {f}
              </span>
            ))}
          </div>
          <div className="flex justify-between">
            <button className="btn" onClick={() => setExportingId(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={selectedFormats.length === 0} onClick={downloadPackage}>
              <Download size={14} /> Download Package
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
