const STORAGE_KEY = 'dd-e2e-skip-onboarding'

/** Lets preview / Playwright reach tab routes without completing onboarding (test builds only). */
export function shouldBypassOnboarding(): boolean {
  if (typeof window === 'undefined' || import.meta.env.VITE_E2E_HOOKS !== '1') return false
  const q = new URLSearchParams(window.location.search)
  if (q.get('onboarding') === 'skip') {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    return true
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
