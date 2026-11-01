import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { useScrollLock } from '../../hooks/useScrollLock'
import { cn } from '../../lib/utils'
import { IconButton } from './IconButton'
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
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  footer?: ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useScrollLock(open)

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
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
        aria-labelledby={titleId}
        className={cn(
          'glass-panel w-full sm:max-w-md max-h-[88dvh] overflow-auto outline-none',
          'rounded-t-2xl sm:rounded-2xl pb-[env(safe-area-inset-bottom)]',
          className,
        )}
      >
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 sm:px-5 sm:pt-4 border-b border-white/10">
          <h2 id={titleId} className="font-display text-base font-semibold tracking-wide text-balance">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X {...uiIconProps} />
          </IconButton>
        </div>
        <div className="px-4 py-4 sm:px-5 text-sm">{children}</div>
        {footer ? (
          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex flex-wrap gap-2 justify-end border-t border-white/5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
