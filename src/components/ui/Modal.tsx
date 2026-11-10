import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from '@phosphor-icons/react'
import { useScrollLock } from '../../hooks/useScrollLock'
import { cn } from '../../lib/utils'
import { useOverlayStackRegister } from '../OverlayStackProvider'
import { uiIconProps } from './iconStyle'
import { OverlayPortal } from './OverlayPortal'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== 'Tab') return
  const nodes = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null,
  )
  if (nodes.length === 0) return
  const first = nodes[0]!
  const last = nodes[nodes.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  footer,
  testId = 'overlay-modal',
  anchorAboveMobileNav = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  footer?: ReactNode
  testId?: string
  anchorAboveMobileNav?: boolean
}) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useScrollLock(open)
  useOverlayStackRegister(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (dialogRef.current) trapFocus(dialogRef.current, e)
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  if (anchorAboveMobileNav) {
    return (
      <OverlayPortal>
        <button
          type="button"
          className="scrim"
          aria-label={t('common.close')}
          data-testid={`${testId}-scrim`}
          onClick={onClose}
        />
        <div
          ref={dialogRef}
          className={cn('sheet', className)}
          data-testid={testId}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <span className="grab" aria-hidden />
          <div className="sheet-h">
            <span className="t-label">{title}</span>
            <button
              type="button"
              className="btn btn--icon btn--secondary"
              aria-label={t('common.close')}
              data-testid={`${testId}-close`}
              onClick={onClose}
            >
              <X {...uiIconProps} width={22} height={22} className="ic" />
            </button>
          </div>
          {children}
        </div>
      </OverlayPortal>
    )
  }

  return (
    <OverlayPortal>
      <div data-overlay-root data-testid={testId} role="presentation">
        <button
          type="button"
          className="scrim"
          aria-label={t('common.close')}
          data-testid={`${testId}-scrim`}
          onClick={onClose}
        />
        <div className="modal-wrap">
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn('modal', className)}
          >
            <h2 id={titleId}>{title}</h2>
            {children}
            {footer ? <div className="modal-act">{footer}</div> : null}
          </div>
        </div>
      </div>
    </OverlayPortal>
  )
}
