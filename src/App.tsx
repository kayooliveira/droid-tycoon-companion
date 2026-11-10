import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { GlassFilters } from './components/GlassFilters'
import { TabScreenSkeleton } from './components/layout/TabScreenSkeleton'
import { SeoManager } from './components/SeoManager'
import { OverlayStackProvider } from './components/OverlayStackProvider'
import { ToastProvider, useToast } from './components/ToastProvider'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { setDocumentLanguage } from './i18n'
import { reloadForPwaUpdate } from './lib/pwaUpdate'
import { AppearanceSync } from './components/AppearanceSync'
import { useAppStore } from './store/useAppStore'

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
const CyclesPage = lazy(() =>
  import('./pages/CyclesPage').then((m) => ({ default: m.CyclesPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const AppearancePage = lazy(() =>
  import('./pages/AppearancePage').then((m) => ({ default: m.AppearancePage })),
)

function OnboardingGate({ children }: { children: ReactNode }) {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

function PwaRefreshListener() {
  const { push } = useToast()
  const { t } = useTranslation()
  useEffect(() => {
    const promptRefresh = () => {
      push(t('pwa.update'), {
        variant: 'info',
        sticky: true,
        action: { label: t('pwa.updateAction'), onClick: reloadForPwaUpdate },
      })
    }
    const autoUpdated = () => push(t('pwa.updatedToast'), { variant: 'success' })
    window.addEventListener('pwa-need-refresh', promptRefresh)
    window.addEventListener('pwa-updated', autoUpdated)
    return () => {
      window.removeEventListener('pwa-need-refresh', promptRefresh)
      window.removeEventListener('pwa-updated', autoUpdated)
    }
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
  return <Suspense fallback={<TabScreenSkeleton />}>{children}</Suspense>
}

export default function App() {
  useEffect(() => {
    const root = document.documentElement
    const supportsSvgBackdrop =
      typeof CSS !== 'undefined' &&
      (CSS.supports('(-webkit-backdrop-filter: url(#lg-nav))') ||
        CSS.supports('(backdrop-filter: url(#lg-nav))') ||
        CSS.supports('(-webkit-backdrop-filter: url(#lg))') ||
        CSS.supports('(backdrop-filter: url(#lg))'))
    if (supportsSvgBackdrop) {
      root.classList.add('glass-refraction-enabled')
    } else {
      root.classList.add('glass-refraction-fallback')
    }
  }, [])

  return (
    <OverlayStackProvider>
      <ToastProvider>
        <GlassFilters />
        <BrowserRouter>
        <AppearanceSync />
        <LocaleSync />
        <SeoManager />
        <PwaRefreshListener />
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/"
            element={
              <OnboardingGate>
                <AppShell />
              </OnboardingGate>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route
              path="progress"
              element={
                <LazyPage>
                  <ProgressPage />
                </LazyPage>
              }
            />
            <Route
              path="cycles"
              element={
                <LazyPage>
                  <CyclesPage />
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
              path="settings/appearance"
              element={
                <LazyPage>
                  <AppearancePage />
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
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </ToastProvider>
    </OverlayStackProvider>
  )
}
