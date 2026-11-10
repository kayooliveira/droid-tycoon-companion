import { useEffect, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useOverlayStackRegister } from '../OverlayStackProvider'
import { uiIconProps } from './iconStyle'
import { OverlayPortal } from './OverlayPortal'

export function Sheet({
  open,
  onClose,
  children,
  testId,
  className,
  closeLabel = 'Fechar',
  headerLabel,
  title,
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  testId?: string
  className?: string
  closeLabel?: string
  headerLabel?: string
  title?: string
  labelledBy?: string
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

  if (!open) return null

  return (
    <OverlayPortal>
      <button
        type="button"
        className="scrim"
        aria-label={closeLabel}
        data-testid={testId ? `${testId}-backdrop` : undefined}
        onClick={onClose}
      />
      <section
        className={cn('sheet', className)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-labelledby={labelledBy}
      >
        <span className="grab" aria-hidden />
        {headerLabel != null ? (
          <div className="sheet-h">
            <span className="t-label">{headerLabel}</span>
            <button
              type="button"
              className="btn btn--icon btn--secondary"
              aria-label={closeLabel}
              data-testid={testId ? `${testId}-close` : 'sheet-close'}
              onClick={onClose}
            >
              <X {...uiIconProps} width={22} height={22} className="ic" />
            </button>
          </div>
        ) : null}
        {children}
      </section>
    </OverlayPortal>
  )
}
