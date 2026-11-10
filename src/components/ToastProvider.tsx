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

const VARIANT_META: Record<
  ToastVariant,
  { Icon: Icon; err?: boolean }
> = {
  success: { Icon: CheckCircle },
  info: { Icon: Info },
  warning: { Icon: Warning },
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
  const { Icon, err } = VARIANT_META[toast.variant]
  const message = toast.detail ? `${toast.message} — ${toast.detail}` : toast.message

  return (
    <div
      data-testid="toast-item"
      data-toast-variant={toast.variant}
      role="status"
      aria-live={toast.live}
      className={cn('toast', err && 'toast--err')}
    >
      <span className="ic" aria-hidden>
        <Icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
      </span>
      <span className="toast-msg" data-testid="toast-title">
        {message}
      </span>
      {toast.detail ? (
        <span className="sr-only" data-testid="toast-detail">
          {toast.detail}
        </span>
      ) : null}
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

export function ToastViewport() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null

  const { toasts, dismiss } = ctx
  const visible = toasts.length > 0

  return (
    <div
      className="toast-slot"
      hidden={!visible ? true : undefined}
      data-testid="toast-stack"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
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

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return { push: ctx.push }
}
