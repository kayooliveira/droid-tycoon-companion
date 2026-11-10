import { useEffect } from 'react'
import { isDesignGateCapture } from '../e2e/designGate'

/** Pins the tab bar to the mock viewport floor during comparar captures. */
export function useGateTabbarAnchor(enabled = true) {
  useEffect(() => {
    if (!isDesignGateCapture() || !enabled) return
    const shell = document.querySelector('.app-shell.app')
    if (!shell) return
    shell.classList.add('gate-tabbar-anchor')
    return () => shell.classList.remove('gate-tabbar-anchor')
  }, [enabled])
}
