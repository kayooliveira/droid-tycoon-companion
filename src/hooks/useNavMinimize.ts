import { useEffect, useRef, useState } from 'react'

/** Shrinks mobile nav on scroll down; expands at top or scroll up (tabBarMinimizeBehavior-style). */
export function useNavMinimize() {
  const [minimized, setMinimized] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const onScroll = () => {
      const y = window.scrollY
      if (y <= 16) {
        setMinimized(false)
      } else if (y > lastY.current + 10) {
        setMinimized(true)
      } else if (y < lastY.current - 10) {
        setMinimized(false)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return minimized
}
