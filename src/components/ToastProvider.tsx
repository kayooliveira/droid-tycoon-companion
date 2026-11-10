import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  type Icon,
} from '@phosphor-icons/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { TOAST_PLACEMENT } from '../lib/toastPlacement'
import { UI_ICON_SIZE, UI_ICON_WEIGHT } from './ui/iconStyle'
import { OverlayPortal } from './ui/OverlayPortal'
import { cn } from '../lib/utils'
import { isDesignGateCapture } from '../e2e/designGate'

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

const VARIANT_META: Record<
  ToastVariant,
  { Icon: Icon; err?: boolean; warn?: boolean }
> = {
  success: { Icon: CheckCircle },
  info: { Icon: Info },
  warning: { Icon: Warning, warn: true },
  error: { Icon: WarningCircle, err: true },
  neutral: { Icon: Info },
}

const LIVE_BY_VARIANT: Record<ToastVariant, 'polite' | 'assertive'> = {
  success: 'polite',
  info: 'polite',
  warning: 'polite',
  error: 'assertive',
  neutral: 'polite',
}

type ToastApi = {
  push: (message: string, options?: ToastPushOptions) => void
  toasts: Toast[]
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const { Icon, err, warn } = VARIANT_META[toast.variant]
  const gateToast = isDesignGateCapture()

  return (
    <div
      data-testid="toast-item"
      data-toast-variant={toast.variant}
      role="status"
      aria-live={toast.live}
      className={cn('toast', err && 'toast--err', warn && 'toast--warn')}
    >
      {gateToast && toast.variant === 'info' && !err && !warn ? (
        <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6" />
          <circle cx="12" cy="7.6" r=".6" />
        </svg>
      ) : (
        <span className="ic" aria-hidden>
          <Icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
        </span>
      )}
      <div className="toast-text">
        <span className="toast-msg" data-testid="toast-title">
          {toast.message}
        </span>
        {toast.detail ? (
          <span className="toast-detail" data-testid="toast-detail">
            {toast.detail}
          </span>
        ) : null}
      </div>
      {toast.action ? (
        <button
          type="button"
          className="toast-act"
          data-testid="toast-action"
          onClick={() => {
            toast.action?.onClick()
            onDismiss(toast.id)
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  )
}

function ToastSlot({
  toasts,
  dismiss,
  className,
}: {
  toasts: Toast[]
  dismiss: (id: string) => void
  className?: string
}) {
  const visible = toasts.length > 0
  return (
    <div
      className={cn('toast-slot', className)}
      hidden={!visible ? true : undefined}
      data-testid="toast-stack"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}

export function ToastViewport() {
  const ctx = useContext(ToastContext)
  if (TOAST_PLACEMENT !== 'inflow' || !ctx) return null
  return <ToastSlot toasts={ctx.toasts} dismiss={ctx.dismiss} />
}

function ToastTopAnchor() {
  const ctx = useContext(ToastContext)
  if (TOAST_PLACEMENT !== 'top' || !ctx || ctx.toasts.length === 0) return null
  return (
    <OverlayPortal>
      <div className="toast-anchor--top">
        <ToastSlot toasts={ctx.toasts} dismiss={ctx.dismiss} />
      </div>
    </OverlayPortal>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, number>>(new Map())

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

  const value = useMemo(
    () => ({ push, toasts, dismiss }),
    [push, toasts, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastTopAnchor />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return { push: ctx.push }
}
