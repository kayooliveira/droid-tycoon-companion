/** True during Playwright / comparar_1a1 capture (INIT_SCRIPT adds this class). */
export function isDesignGateCapture(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('e2e-safe-area')
}

/** Onboarding comparar captures always pass `e2e_onb_step` (playwright-only query). */
export function isOnboardingGateCapture(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('e2e_onb_step')
}
