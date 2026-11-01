import { useEffect, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastProvider } from './components/ToastProvider'
import { DashboardPage } from './pages/DashboardPage'
import { DroiddexPage } from './pages/DroiddexPage'
import { FusionLabPage } from './pages/FusionLabPage'
import { InventoryPage } from './pages/InventoryPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProgressPage } from './pages/ProgressPage'
import { SellCenterPage } from './pages/SellCenterPage'
import { SettingsPage } from './pages/SettingsPage'
import { applyTheme, useAppStore } from './store/useAppStore'

function OnboardingGate({ children }: { children: ReactNode }) {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  const theme = useAppStore((s) => s.settings.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ToastProvider>
      <HashRouter>
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
      </HashRouter>
    </ToastProvider>
  )
}
