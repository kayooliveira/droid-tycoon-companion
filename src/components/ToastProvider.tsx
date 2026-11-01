import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Button } from './ui/Button'

type ToastAction = { label: string; onClick: () => void }

type Toast = { id: string; message: string; action?: ToastAction; sticky?: boolean }

const ToastContext = createContext<{
  push: (message: string, options?: { action?: ToastAction; sticky?: boolean }) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message: string, options?: { action?: ToastAction; sticky?: boolean }) => {
      const id = crypto.randomUUID()
      setToasts((t) => [...t, { id, message, action: options?.action, sticky: options?.sticky }])
      if (!options?.sticky) {
        window.setTimeout(() => dismiss(id), 4200)
      }
    },
    [dismiss],
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-[60] flex flex-col gap-2 max-w-sm md:ml-auto pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-panel rounded-xl px-4 py-3 text-sm shadow-lg pointer-events-auto flex flex-wrap items-center gap-3"
          >
            <span className="flex-1 min-w-[12rem]">{t.message}</span>
            {t.action ? (
              <Button
                variant="secondary"
                className="min-h-11 py-2 text-xs shrink-0"
                onClick={() => {
                  t.action?.onClick()
                  dismiss(t.id)
                }}
              >
                {t.action.label}
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
