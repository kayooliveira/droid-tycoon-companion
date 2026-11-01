import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { PageSkeleton } from './components/PageSkeleton'
import { SeoManager } from './components/SeoManager'
import { ToastProvider, useToast } from './components/ToastProvider'
import { OnboardingPage } from './pages/OnboardingPage'
import { setDocumentLanguage } from './i18n'
import { reloadForPwaUpdate } from './lib/pwaUpdate'
import { applyTheme, useAppStore } from './store/useAppStore'

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProgressPage = lazy(() =>
  import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })),
)
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((m) => ({ default: m.InventoryPage })),
)
const SellCenterPage = lazy(() =>
  import('./pages/SellCenterPage').then((m) => ({ default: m.SellCenterPage })),
)
const DroiddexPage = lazy(() =>
  import('./pages/DroiddexPage').then((m) => ({ default: m.DroiddexPage })),
)
const FusionLabPage = lazy(() =>
  import('./pages/FusionLabPage').then((m) => ({ default: m.FusionLabPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))

function OnboardingGate({ children }: { children: ReactNode }) {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

function PwaRefreshListener() {
  const { push } = useToast()
  const { t } = useTranslation()
  useEffect(() => {
    const handler = () => {
      push(t('pwa.update'), {
        sticky: true,
        action: { label: t('pwa.updateAction'), onClick: reloadForPwaUpdate },
      })
    }
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

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
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
            <Route
              index
              element={
                <LazyPage>
                  <DashboardPage />
                </LazyPage>
              }
            />
            <Route
              path="progress"
              element={
                <LazyPage>
                  <ProgressPage />
                </LazyPage>
              }
            />
            <Route
              path="inventory"
              element={
                <LazyPage>
                  <InventoryPage />
                </LazyPage>
              }
            />
            <Route
              path="sell"
              element={
                <LazyPage>
                  <SellCenterPage />
                </LazyPage>
              }
            />
            <Route
              path="droiddex"
              element={
                <LazyPage>
                  <DroiddexPage />
                </LazyPage>
              }
            />
            <Route
              path="fusion"
              element={
                <LazyPage>
                  <FusionLabPage />
                </LazyPage>
              }
            />
            <Route
              path="settings"
              element={
                <LazyPage>
                  <SettingsPage />
                </LazyPage>
              }
            />
            <Route
              path="about"
              element={
                <LazyPage>
                  <AboutPage />
                </LazyPage>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
