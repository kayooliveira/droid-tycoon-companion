import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  ArrowCounterClockwise,
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
import { Button } from './ui/Button'
import { OverlayPortal } from './ui/OverlayPortal'
import { UI_ICON_SIZE, UI_ICON_WEIGHT } from './ui/iconStyle'
import { cn } from '../lib/utils'

export type ToastVariant = 'success' | 'info' | 'warning' | 'error' | 'neutral'

type ToastAction = { label: string; onClick: () => void }

type Toast = {
  id: string
  message: string
  variant: ToastVariant
  action?: ToastAction
  sticky?: boolean
  replaceKey?: string
  durationMs: number
  showProgress: boolean
  live: 'polite' | 'assertive'
  exiting?: boolean
}

export type ToastPushOptions = {
  variant?: ToastVariant
  action?: ToastAction
  sticky?: boolean
  replaceKey?: string
  /** Auto-dismiss ms; defaults by variant unless sticky */
  durationMs?: number
  /** Show countdown bar (default true when action is set) */
  showProgress?: boolean
  live?: 'polite' | 'assertive'
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 3800,
  info: 3800,
  warning: 5200,
  error: 5200,
  neutral: 4000,
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { panel: string; icon: string; Icon: Icon }
> = {
  success: {
    panel: 'border-[var(--ui-badge-success-border)] bg-[var(--ui-badge-success-bg)]',
    icon: 'text-[var(--ui-badge-success-fg)]',
    Icon: CheckCircle,
  },
  info: {
    panel: 'border-[var(--ui-badge-info-border)] bg-[var(--ui-badge-info-bg)]',
    icon: 'text-[var(--ui-badge-info-fg)]',
    Icon: Info,
  },
  warning: {
    panel: 'border-[var(--ui-badge-warn-border)] bg-[var(--ui-badge-warn-bg)]',
    icon: 'text-[var(--ui-badge-warn-fg)]',
    Icon: Warning,
  },
  error: {
    panel: 'border-[var(--ui-badge-danger-border)] bg-[var(--ui-badge-danger-bg)]',
    icon: 'text-[var(--ui-badge-danger-fg)]',
    Icon: WarningCircle,
  },
  neutral: {
    panel: 'border-ui bg-ui-raised/95',
    icon: 'text-ui-secondary',
    Icon: ArrowCounterClockwise,
  },
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
  const styles = VARIANT_STYLES[toast.variant]
  const VariantIcon = styles.Icon

  const handlePointerDown = (e: ReactPointerEvent) => {
    startY.current = e.clientY
    dragY.current = 0
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (startY.current == null) return
    const dy = e.clientY - startY.current
    if (dy < 0) {
      dragY.current = dy
      setOffsetY(dy)
    }
  }

  const handlePointerUp = () => {
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
      initial={reducedMotion ? false : { opacity: 0, y: -12 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ transform: offsetY ? `translateY(${offsetY}px)` : undefined }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-testid="toast-item"
      data-toast-variant={toast.variant}
      role="status"
      aria-live={toast.live}
      className={cn(
        'glass-panel pointer-events-auto touch-pan-y overflow-hidden rounded-xl shadow-lg',
        'flex flex-col gap-2 px-3 py-3 text-sm',
        styles.panel,
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <VariantIcon
          size={UI_ICON_SIZE + 2}
          weight={UI_ICON_WEIGHT}
          className={cn('mt-0.5 shrink-0', styles.icon)}
          aria-hidden
        />
        <span className="min-w-[10rem] flex-1 text-pretty text-ui-fg">{toast.message}</span>
        {toast.action ? (
          <Button
            variant="secondary"
            className="min-h-11 shrink-0 py-2 text-xs"
            data-testid="toast-action"
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
          >
            {toast.action.label}
          </Button>
        ) : null}
      </div>
      {toast.showProgress && !toast.sticky ? (
        <div
          className="h-0.5 w-full overflow-hidden rounded-full bg-ui-chart-track"
          aria-hidden
          data-testid="toast-progress-track"
        >
          <div
            key={toast.id}
            className="h-full origin-left rounded-full bg-current opacity-40"
            style={
              reducedMotion
                ? { width: '100%' }
                : {
                    animation: `toast-progress ${toast.durationMs}ms linear forwards`,
                  }
            }
          />
        </div>
      ) : null}
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, number>>(new Map())
  const reducedMotion = useReducedMotion()

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
        options?.durationMs ??
        (options?.sticky ? 0 : DEFAULT_DURATION[variant])
      const showProgress =
        options?.showProgress ?? Boolean(options?.action && !options?.sticky)
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
            variant,
            action: options?.action,
            sticky: options?.sticky,
            replaceKey: options?.replaceKey,
            durationMs: durationMs || DEFAULT_DURATION[variant],
            showProgress,
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
    return () => {
      for (const t of timers.current.values()) {
        window.clearTimeout(t)
      }
      timers.current.clear()
    }
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <OverlayPortal>
        <div
          data-testid="toast-stack"
          className="pointer-events-none fixed left-3 right-3 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-toast flex max-w-sm flex-col gap-2 md:left-auto md:right-4 md:ml-auto"
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
