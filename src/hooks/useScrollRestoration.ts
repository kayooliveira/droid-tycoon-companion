import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const prefix = 'dt-scroll:'

function scrollContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.app-shell .scroll')
}

export function useScrollRestoration() {
  const location = useLocation()

  useEffect(() => {
    const key = `${prefix}${location.pathname}`
    const raw = sessionStorage.getItem(key)
    const el = scrollContainer()
    if (raw && el) {
      const y = Number.parseInt(raw, 10)
      if (!Number.isNaN(y)) {
        requestAnimationFrame(() => {
          el.scrollTop = y
        })
      }
    }

    return () => {
      const target = scrollContainer()
      if (target) sessionStorage.setItem(key, String(target.scrollTop))
    }
  }, [location.pathname])
}
