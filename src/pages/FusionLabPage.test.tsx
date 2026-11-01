import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { initI18n } from '../i18n'
import { FusionLabPage } from './FusionLabPage'
import { useAppStore } from '../store/useAppStore'

const i18n = initI18n('en')

describe('FusionLabPage', () => {
  it('renders fusion rule descriptions, not raw JSON', () => {
    useAppStore.getState().resetAll()
    useAppStore.getState().setOnboardingComplete(true)
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <FusionLabPage />
        </MemoryRouter>
      </I18nextProvider>,
    )
    expect(screen.getByText(/Three of the same droid/i)).toBeInTheDocument()
    expect(screen.queryByText(/\{"id":"tier-up"/)).not.toBeInTheDocument()
  })
})
