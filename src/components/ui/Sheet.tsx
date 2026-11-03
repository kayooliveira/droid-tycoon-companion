import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useOverlayStackRegister } from '../OverlayStackProvider'

export function Sheet({
  open,
  onClose,
  children,
  testId,
  className,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  testId?: string
  className?: string
}) {
  useScrollLock(open)
  useOverlayStackRegister(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      {open ? (
        <button
          type="button"
          className="dc-sheet-backdrop"
          aria-label="Fechar"
          onClick={onClose}
        />
      ) : null}
      <div
        className={cn('dc-sheet', open && 'dc-sheet-open', className)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
      >
        <div className="dc-sheet-grabber" aria-hidden />
        {children}
      </div>
    </>,
    document.body,
  )
}
