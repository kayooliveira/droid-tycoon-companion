import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  type Icon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { OverlayPortal } from './ui/OverlayPortal'
import { UI_ICON_SIZE, UI_ICON_WEIGHT } from './ui/iconStyle'
import { cn } from '../lib/utils'

export type ToastVariant = 'success' | 'info' | 'warning' | 'error' | 'neutral'

type ToastAction = { label: string; onClick: () => void }

type Toast = {
  id: string
  message: string
  detail?: string
  variant: ToastVariant
  action?: ToastAction
  sticky?: boolean
  replaceKey?: string
  durationMs: number
  live: 'polite' | 'assertive'
}

export type ToastPushOptions = {
  variant?: ToastVariant
  detail?: string
  action?: ToastAction
  sticky?: boolean
  replaceKey?: string
  durationMs?: number
  live?: 'polite' | 'assertive'
}

const TOAST_DURATION_MS = 4000

const VARIANT_META: Record<ToastVariant, { Icon: Icon; iconClass: string }> = {
  success: { Icon: CheckCircle, iconClass: 'toast-icon--success' },
  info: { Icon: Info, iconClass: 'toast-icon--info' },
  warning: { Icon: Warning, iconClass: 'toast-icon--warning' },
  error: { Icon: WarningCircle, iconClass: 'toast-icon--error' },
  neutral: { Icon: Info, iconClass: 'toast-icon--info' },
}

const LIVE_BY_VARIANT: Record<ToastVariant, 'polite' | 'assertive'> = {
  success: 'polite',
  info: 'polite',
  warning: 'polite',
  error: 'assertive',
  neutral: 'polite',
}

const ToastContext = createContext<{
  push: (message: string, options?: ToastPushOptions) => void
} | null>(null)

function useOverlaySheetOpen() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const read = () => {
      setOpen(document.documentElement.dataset.overlayOpen === 'true')
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-overlay-open'],
    })
    return () => obs.disconnect()
  }, [])

  return open
}

function ToastItem({
  toast,
  onDismiss,
  reducedMotion,
}: {
  toast: Toast
  onDismiss: (id: string) => void
  reducedMotion: boolean
}) {
  const startY = useRef<number | null>(null)
  const dragY = useRef(0)
  const [offsetY, setOffsetY] = useState(0)
  const { Icon, iconClass } = VARIANT_META[toast.variant]

  const handlePointerDown = (e: ReactPointerEvent) => {
    startY.current = e.clientY
    dragY.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (startY.current == null) return
    const dy = e.clientY - startY.current
    if (dy < 0) {
      dragY.current = dy
      setOffsetY(dy)
    }
  }

  const finishPointer = () => {
    if (dragY.current < -48) {
      onDismiss(toast.id)
    } else {
      setOffsetY(0)
    }
    startY.current = null
    dragY.current = 0
  }

  return (
    <motion.div
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: -16 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{ transform: offsetY ? `translateY(${offsetY}px)` : undefined }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      data-testid="toast-item"
      data-toast-variant={toast.variant}
      role="status"
      aria-live={toast.live}
      className="toast-surface pointer-events-auto touch-pan-y"
    >
      <span className={cn('toast-icon', iconClass)} aria-hidden>
        <Icon size={UI_ICON_SIZE + 2} weight={UI_ICON_WEIGHT} />
      </span>
      <div className="toast-copy min-w-0 flex-1">
        <p className="toast-title">{toast.message}</p>
        {toast.detail ? <p className="toast-detail">{toast.detail}</p> : null}
      </div>
      {toast.action ? (
        <button
          type="button"
          className="toast-action"
          data-testid="toast-action"
          onClick={() => {
            toast.action?.onClick()
            onDismiss(toast.id)
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, number>>(new Map())
  const reducedMotion = useReducedMotion()
  const sheetOpen = useOverlaySheetOpen()

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t != null) {
      window.clearTimeout(t)
      timers.current.delete(id)
    }
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((t) => t.filter((x) => x.id !== id))
    },
    [clearTimer],
  )

  const push = useCallback(
    (message: string, options?: ToastPushOptions) => {
      const variant = options?.variant ?? 'info'
      const durationMs =
        options?.durationMs ?? (options?.sticky ? 0 : TOAST_DURATION_MS)
      const live = options?.live ?? LIVE_BY_VARIANT[variant]

      const id = crypto.randomUUID()
      setToasts((prev) => {
        const filtered =
          options?.replaceKey != null
            ? prev.filter((t) => t.replaceKey !== options.replaceKey)
            : prev
        const next: Toast[] = [
          ...filtered,
          {
            id,
            message,
            detail: options?.detail,
            variant,
            action: options?.action,
            sticky: options?.sticky,
            replaceKey: options?.replaceKey,
            durationMs: durationMs || TOAST_DURATION_MS,
            live,
          },
        ]
        return next.slice(-2)
      })

      if (!options?.sticky && durationMs > 0) {
        clearTimer(id)
        const handle = window.setTimeout(() => dismiss(id), durationMs)
        timers.current.set(id, handle)
      }
    },
    [clearTimer, dismiss],
  )

  useEffect(() => {
    const timersMap = timers.current
    return () => {
      for (const t of timersMap.values()) {
        window.clearTimeout(t)
      }
      timersMap.clear()
    }
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <OverlayPortal>
        <div
          data-testid="toast-stack"
          className={cn(
            'toast-stack pointer-events-none fixed inset-x-0 z-toast mx-auto flex w-[calc(100%-24px)] max-w-[360px] flex-col gap-2 px-0',
            'top-[calc(env(safe-area-inset-top,0px)+8px)]',
            sheetOpen && 'toast-stack--sheet-open',
          )}
        >
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                toast={t}
                onDismiss={dismiss}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </AnimatePresence>
        </div>
      </OverlayPortal>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
