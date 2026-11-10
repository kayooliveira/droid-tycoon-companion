import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { setPwaUpdateFn } from './lib/pwaUpdate.ts'
import { initI18n, setDocumentLanguage } from './i18n/index.ts'
import { detectBrowserLocale } from './i18n/detectLocale.ts'
import { useAppStore } from './store/useAppStore.ts'
import './index.css'

const stored = localStorage.getItem('droid-tycoon-companion-store')
let initialLocale = detectBrowserLocale()
try {
  if (stored) {
    const parsed = JSON.parse(stored) as {
      state?: { settings?: { locale?: string; localeSource?: string } }
    }
    const loc = parsed?.state?.settings?.locale
    if (loc === 'pt-BR' || loc === 'en') initialLocale = loc
  }
} catch {
  /* use browser default */
}

initI18n(initialLocale)
setDocumentLanguage(initialLocale)

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa-need-refresh'))
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('pwa-updated'))
        }
      })
    })
  },
})
setPwaUpdateFn(updateSW)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

useAppStore.persist.onFinishHydration(() => {
  const s = useAppStore.getState()
  if (s.settings.localeSource === 'auto') {
    const detected = detectBrowserLocale()
    if (detected !== s.settings.locale) {
      s.setLocale(detected, 'auto')
      void initI18n(detected)
      setDocumentLanguage(detected)
    }
  } else {
    void initI18n(s.settings.locale)
    setDocumentLanguage(s.settings.locale)
  }
})
