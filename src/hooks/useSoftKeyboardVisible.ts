import { useEffect, useRef, useState } from 'react'

/**
 * Detects a visible soft keyboard via visualViewport shrink vs the tallest
 * layout height seen this session (handles iOS shrinking both innerHeight and vv).
 */
export function useSoftKeyboardVisible(focused: boolean): boolean {
  const [open, setOpen] = useState(false)
  const baselineRef = useRef(0)

  useEffect(() => {
    if (!focused) {
      setOpen(false)
      return
    }

    const vv = window.visualViewport
    if (!vv) {
      setOpen(true)
      return
    }

    const thresholdPx = 72
    const measure = () => {
      baselineRef.current = Math.max(
        baselineRef.current,
        window.innerHeight,
        vv.height,
        vv.height + vv.offsetTop,
      )
      const gap = baselineRef.current - vv.height
      setOpen(gap > thresholdPx)
    }

    measure()
    vv.addEventListener('resize', measure)
    vv.addEventListener('scroll', measure)
    window.addEventListener('resize', measure)
    return () => {
      vv.removeEventListener('resize', measure)
      vv.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [focused])

  return open
}
