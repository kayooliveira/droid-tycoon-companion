import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from '@phosphor-icons/react'
import { useScrollLock } from '../../hooks/useScrollLock'
import { cn } from '../../lib/utils'
import { useOverlayStackRegister } from '../OverlayStackProvider'
import { IconButton } from './IconButton'
import { Glass } from './Glass'
import { OverlayPortal } from './OverlayPortal'
import { uiIconProps } from './iconStyle'

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

  const dialogBody = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="bg-ui-modal backdrop-saturate-150 min-h-full outline-none text-ui-fg"
    >
      <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
        <span className="h-1 w-10 rounded-full bg-ui-handle" />
      </div>
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 sm:px-5 sm:pt-4 border-b border-ui">
        <h2 id={titleId} className="font-display text-base font-semibold tracking-wide text-balance text-ui-fg">
          {title}
        </h2>
        <IconButton label={t('common.close')} onClick={onClose} data-testid={`${testId}-close`}>
          <X {...uiIconProps} />
        </IconButton>
      </div>
      <div className="px-4 py-4 sm:px-5 text-sm">{children}</div>
      {footer ? (
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5 pt-0 flex flex-wrap gap-2 justify-end border-t border-ui-subtle">
          {footer}
        </div>
      ) : null}
    </div>
  )

  return (
    <OverlayPortal>
      <div
        data-overlay-root
        data-testid={testId}
        className={cn(
          'fixed inset-0 z-overlay',
          anchorAboveMobileNav && 'pointer-events-none',
          !anchorAboveMobileNav && 'flex items-end sm:items-center justify-center overlay-scrim backdrop-blur-md p-0 sm:p-4',
        )}
        role="presentation"
        onMouseDown={
          anchorAboveMobileNav
            ? undefined
            : (e) => {
                if (e.target === e.currentTarget) onClose()
              }
        }
      >
        {anchorAboveMobileNav ? (
          <div
            className="modal-above-mobile-nav-scrim overlay-scrim backdrop-blur-md"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) onClose()
            }}
          />
        ) : null}
        <div
          className={cn(
            anchorAboveMobileNav
              ? 'modal-above-mobile-nav-panel flex justify-center pointer-events-none'
              : 'contents',
          )}
        >
          <Glass
            as="div"
            variant="regular"
            className={cn(
              'relative z-modal w-full overflow-auto pointer-events-auto',
              anchorAboveMobileNav
                ? 'max-h-[min(70dvh,calc(100dvh-var(--mobile-nav-clearance)-24px))] rounded-t-2xl'
                : 'sm:max-w-md max-h-[88dvh] rounded-t-2xl sm:rounded-2xl pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:pb-[calc(env(safe-area-inset-bottom,0px)+12px)]',
              className,
            )}
          >
            {dialogBody}
          </Glass>
        </div>
      </div>
    </OverlayPortal>
  )
}
