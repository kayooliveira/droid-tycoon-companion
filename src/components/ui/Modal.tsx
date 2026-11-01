import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useScrollLock } from '../../hooks/useScrollLock'
import { cn } from '../../lib/utils'
import { Button } from './Button'

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'glass-panel w-full max-w-lg max-h-[85dvh] overflow-auto rounded-2xl p-5 outline-none',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-wide">{title}</h2>
          <Button variant="ghost" aria-label="Close" onClick={onClose} className="px-2 py-2">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
