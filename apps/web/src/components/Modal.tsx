import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, width }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <X size={18} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  )
}
