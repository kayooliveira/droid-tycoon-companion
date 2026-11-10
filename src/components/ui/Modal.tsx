import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useScrollLock } from '../../hooks/useScrollLock'
import { cn } from '../../lib/utils'
import { useOverlayStackRegister } from '../OverlayStackProvider'
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
          className="scrim scrim--above"
          aria-label={t('common.close')}
          data-testid={`${testId}-scrim`}
          onClick={onClose}
        />
        <div
          ref={dialogRef}
          className={cn('sheet sheet--above', className)}
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
              <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </OverlayPortal>
    )
  }

  return (
    <OverlayPortal>
      <div data-overlay-root role="presentation">
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
            aria-label={title}
            data-testid={testId}
            className={cn('modal', className)}
          >
            <div
              className="row2"
              style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <h2 id={titleId}>{title}</h2>
              <button
                type="button"
                className="btn btn--icon btn--ghost"
                aria-label={t('common.close')}
                data-testid={`${testId}-close`}
                onClick={onClose}
              >
                <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                  <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
                </svg>
              </button>
            </div>
            {children}
            {footer ? <div className="modal-act">{footer}</div> : null}
          </div>
        </div>
      </div>
    </OverlayPortal>
  )
}
