import { useEffect, useState } from 'react'

/** True when visual viewport is noticeably shorter than the layout viewport (mobile soft keyboard). */
export function useSoftKeyboardVisible(active: boolean): boolean {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!active) {
      setOpen(false)
      return
    }
    const vv = window.visualViewport
    if (!vv) return

    const thresholdPx = 72
    const measure = () => {
      const gap = window.innerHeight - vv.height
      setOpen(gap > thresholdPx)
    }

    measure()
    vv.addEventListener('resize', measure)
    vv.addEventListener('scroll', measure)
    return () => {
      vv.removeEventListener('resize', measure)
      vv.removeEventListener('scroll', measure)
    }
  }, [active])

  return open
}
