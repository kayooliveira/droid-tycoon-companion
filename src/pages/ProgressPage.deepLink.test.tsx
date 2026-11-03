import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import { initI18n } from '../i18n'
import { useAppStore } from '../store/useAppStore'
import { OverlayStackProvider } from '../components/OverlayStackProvider'
import { ToastProvider } from '../components/ToastProvider'
import { ProgressPage } from './ProgressPage'

const i18n = initI18n('en')

describe('ProgressPage deep link', () => {
  beforeEach(() => {
    useAppStore.getState().resetAll()
    useAppStore.getState().setOnboardingComplete(true)
  })

  it('opens list mode and highlights step from ciclo and passo query', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ToastProvider>
          <OverlayStackProvider>
            <MemoryRouter initialEntries={['/progress?ciclo=1&passo=5']}>
              <Routes>
                <Route path="/progress" element={<ProgressPage />} />
              </Routes>
            </MemoryRouter>
          </OverlayStackProvider>
        </ToastProvider>
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('progress-rebirth-list')).toBeInTheDocument()
    })
    expect(document.getElementById('progress-step-5')).toBeTruthy()
  })
})
