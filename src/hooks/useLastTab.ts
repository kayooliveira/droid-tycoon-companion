import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TAB_KEY = 'droiddeck:lastTab'

const TAB_PATHS = new Set(['/', '/progress', '/inventory', '/cycles'])

function pathToTab(pathname: string): string | null {
  if (TAB_PATHS.has(pathname)) return pathname
  if (['/sell', '/droiddex', '/fusion', '/about', '/settings'].includes(pathname)) return '/settings'
  return null
}

export function useLastTabRestore() {
  const navigate = useNavigate()
  const location = useLocation()
  const restoredRef = useRef(false)

  useEffect(() => {
    if (restoredRef.current) return
    if (location.pathname !== '/') return
    restoredRef.current = true
    try {
      const saved = localStorage.getItem(TAB_KEY)
      if (saved && saved !== '/' && TAB_PATHS.has(saved)) {
        navigate(saved, { replace: true })
      }
    } catch {
      void 0
    }
  }, [location.pathname, navigate])
}

export function persistLastTab(pathname: string) {
  const tab = pathToTab(pathname)
  if (!tab) return
  try {
    localStorage.setItem(TAB_KEY, tab)
  } catch {
    void 0
  }
}
