import { useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useStore } from '../store'

export default function SLDPreview() {
  const { activeProject } = useStore()
  const [zoom, setZoom] = useState(1)
  const svgRef = useRef<SVGSVGElement>(null)

  const capacity = activeProject?.capacity_kwp ?? 5000
  const isBess = activeProject?.type === 'pv-bess'
  const numStrings = Math.min(6, Math.max(3, Math.round(capacity / 1500)))
  const numInverters = Math.min(4, Math.max(2, Math.round(capacity / 2500)))

  const stringXs = useMemo(() => Array.from({ length: numStrings }, (_, i) => 60 + i * 90), [numStrings])
  const invXs = useMemo(() => Array.from({ length: numInverters }, (_, i) => 120 + i * (numStrings * 90) / numInverters), [numInverters, numStrings])

  const exportSvg = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeProject?.name ?? 'project'}-sld.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const width = Math.max(700, numStrings * 90 + 120)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Single Line Diagram</div>
          <div className="page-subtitle">{activeProject?.name ?? 'No project selected'}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))}><ZoomOut size={14} /></button>
          <button className="btn btn-sm" onClick={() => setZoom(z => Math.min(2, +(z + 0.15).toFixed(2)))}><ZoomIn size={14} /></button>
          <button className="btn btn-sm" onClick={() => setZoom(1)}>Reset</button>
          <button className="btn btn-primary btn-sm" onClick={exportSvg}><Download size={14} /> Export SVG</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.15s' }}>
          <svg ref={svgRef} width={width} height={420} viewBox={`0 0 ${width} 420`} style={{ background: '#0b1220', borderRadius: 8 }}>
            {/* PV strings */}
            {stringXs.map((x, i) => (
              <g key={i}>
                <rect x={x - 18} y={30} width={36} height={70} rx={4} fill="#164e63" stroke="#0ea5e9" />
                <text x={x} y={20} fill="#94a3b8" fontSize={10} textAnchor="middle">STR-{i + 1}</text>
                <line x1={x} y1={100} x2={x} y2={140} stroke="#0ea5e9" strokeWidth={2} />
              </g>
            ))}

            {/* Combiner box */}
            <rect x={width / 2 - 90} y={140} width={180} height={36} rx={4} fill="#1e293b" stroke="#334155" />
            <text x={width / 2} y={163} fill="#f1f5f9" fontSize={12} textAnchor="middle">DC Combiner Box</text>
            <line x1={width / 2} y1={176} x2={width / 2} y2={210} stroke="#0ea5e9" strokeWidth={3} />

            {/* Inverters */}
            {invXs.map((x, i) => (
              <g key={i}>
                <rect x={x - 45} y={210} width={90} height={44} rx={4} fill="#0c4a6e" stroke="#0ea5e9" />
                <text x={x} y={236} fill="#f1f5f9" fontSize={11} textAnchor="middle">INV-{i + 1}</text>
                <line x1={x} y1={254} x2={width / 2} y2={290} stroke="#22c55e" strokeWidth={2} />
              </g>
            ))}

            {/* AC bus */}
            <rect x={width / 2 - 130} y={290} width={260} height={30} rx={4} fill="#1e293b" stroke="#334155" />
            <text x={width / 2} y={310} fill="#f1f5f9" fontSize={12} textAnchor="middle">AC Bus / Switchgear</text>

            {isBess && (
              <g>
                <line x1={width / 2 + 130} y1={305} x2={width / 2 + 190} y2={305} stroke="#f59e0b" strokeWidth={2} />
                <rect x={width / 2 + 190} y={280} width={90} height={50} rx={4} fill="#78350f" stroke="#f59e0b" />
                <text x={width / 2 + 235} y={309} fill="#f1f5f9" fontSize={11} textAnchor="middle">BESS</text>
              </g>
            )}

            <line x1={width / 2} y1={320} x2={width / 2} y2={350} stroke="#22c55e" strokeWidth={3} />

            {/* Transformer */}
            <circle cx={width / 2 - 12} cy={368} r={16} fill="none" stroke="#f1f5f9" strokeWidth={2} />
            <circle cx={width / 2 + 12} cy={368} r={16} fill="none" stroke="#f1f5f9" strokeWidth={2} />
            <text x={width / 2} y={400} fill="#94a3b8" fontSize={11} textAnchor="middle">Step-up Transformer</text>

            <line x1={width / 2} y1={352} x2={width / 2} y2={352} stroke="#22c55e" strokeWidth={3} />
            <line x1={width / 2} y1={384} x2={width / 2} y2={410} stroke="#22c55e" strokeWidth={3} />
            <text x={width / 2 + 60} y={415} fill="#94a3b8" fontSize={11}>Grid Connection ▶</text>
          </svg>
        </div>
      </div>
      <p className="text-muted text-sm mt-3">
        Diagram scaled for a {(capacity / 1000).toFixed(1)} MWp array with {numStrings} representative string groups and {numInverters} inverter blocks
        {isBess ? ', including BESS coupling on the AC bus.' : '.'}
      </p>
    </div>
  )
}
