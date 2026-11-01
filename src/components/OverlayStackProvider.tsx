import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'

type OverlayStackContextValue = {
  register: () => () => void
}

const OverlayStackContext = createContext<OverlayStackContextValue | null>(null)

let overlayCount = 0

function syncOverlayDataset() {
  if (typeof document === 'undefined') return
  if (overlayCount > 0) {
    document.documentElement.dataset.overlayOpen = 'true'
  } else {
    delete document.documentElement.dataset.overlayOpen
  }
}

export function OverlayStackProvider({ children }: { children: ReactNode }) {
  const register = useCallback(() => {
    overlayCount += 1
    syncOverlayDataset()
    return () => {
      overlayCount = Math.max(0, overlayCount - 1)
      syncOverlayDataset()
    }
  }, [])

  const value = useMemo(() => ({ register }), [register])

  return <OverlayStackContext.Provider value={value}>{children}</OverlayStackContext.Provider>
}

export function useOverlayStackRegister(active: boolean) {
  const ctx = useContext(OverlayStackContext)
  if (!ctx) throw new Error('useOverlayStackRegister requires OverlayStackProvider')

  useEffect(() => {
    if (!active) return
    return ctx.register()
  }, [active, ctx])
}
