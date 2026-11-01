import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const prefix = 'dt-scroll:'

export function useScrollRestoration() {
  const location = useLocation()

  useEffect(() => {
    const key = `${prefix}${location.pathname}`
    const raw = sessionStorage.getItem(key)
    if (raw) {
      const y = Number.parseInt(raw, 10)
      if (!Number.isNaN(y)) {
        requestAnimationFrame(() => window.scrollTo(0, y))
      }
    }

    return () => {
      sessionStorage.setItem(key, String(window.scrollY))
    }
  }, [location.pathname])
}
