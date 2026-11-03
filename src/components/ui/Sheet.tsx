import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useOverlayStackRegister } from '../OverlayStackProvider'
import { IconButton } from './IconButton'
import { uiIconProps } from './iconStyle'

export function Sheet({
  open,
  onClose,
  children,
  testId,
  className,
  closeLabel = 'Fechar',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  testId?: string
  className?: string
  closeLabel?: string
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
          aria-label={closeLabel}
          data-testid={testId ? `${testId}-backdrop` : undefined}
          onClick={onClose}
        />
      ) : null}
      <div
        className={cn('dc-sheet', open && 'dc-sheet-open', className)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative">
          <div className="dc-sheet-grabber" aria-hidden />
          <IconButton
            label={closeLabel}
            className="absolute right-3 top-1 z-10"
            data-testid={testId ? `${testId}-close` : 'sheet-close'}
            onClick={onClose}
          >
            <X {...uiIconProps} />
          </IconButton>
        </div>
        {children}
      </div>
    </>,
    document.body,
  )
}
