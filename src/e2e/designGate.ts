/** True during Playwright / comparar_1a1 capture (INIT_SCRIPT adds this class). */
export function isDesignGateCapture(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('e2e-safe-area')
}
