import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { SeoManager } from './components/SeoManager'
import { ToastProvider, useToast } from './components/ToastProvider'
import { DashboardPage } from './pages/DashboardPage'
import { DroiddexPage } from './pages/DroiddexPage'
import { FusionLabPage } from './pages/FusionLabPage'
import { InventoryPage } from './pages/InventoryPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProgressPage } from './pages/ProgressPage'
import { SellCenterPage } from './pages/SellCenterPage'
import { SettingsPage } from './pages/SettingsPage'
import { setDocumentLanguage } from './i18n'
import { applyTheme, useAppStore } from './store/useAppStore'

function OnboardingGate({ children }: { children: ReactNode }) {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

function PwaRefreshListener() {
  const { push } = useToast()
  const { t } = useTranslation()
  useEffect(() => {
    const handler = () => push(t('pwa.update'))
    window.addEventListener('pwa-need-refresh', handler)
    return () => window.removeEventListener('pwa-need-refresh', handler)
  }, [push, t])
  return null
}

function LocaleSync() {
  const locale = useAppStore((s) => s.settings.locale)
  const { i18n } = useTranslation()
  useEffect(() => {
    void i18n.changeLanguage(locale)
    setDocumentLanguage(locale)
  }, [locale, i18n])
  return null
}

export default function App() {
  const theme = useAppStore((s) => s.settings.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ToastProvider>
      <BrowserRouter>
        <LocaleSync />
        <SeoManager />
        <PwaRefreshListener />
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            element={
              <OnboardingGate>
                <AppShell />
              </OnboardingGate>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="sell" element={<SellCenterPage />} />
            <Route path="droiddex" element={<DroiddexPage />} />
            <Route path="fusion" element={<FusionLabPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
