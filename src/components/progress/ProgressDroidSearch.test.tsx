import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initI18n } from '../../i18n'
import { useAppStore } from '../../store/useAppStore'
import { ProgressDroidSearch } from './ProgressDroidSearch'

const i18n = initI18n('pt-BR')

describe('ProgressDroidSearch', () => {
  beforeEach(() => {
    cleanup()
    useAppStore.getState().resetAll()
    useAppStore.getState().setOnboardingComplete(true)
  })

  afterEach(() => {
    cleanup()
  })

  it('finds MO-TRAK from motrak and groups by cycle', async () => {
    const onNav = vi.fn()
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ProgressDroidSearch onNavigateToStep={onNav} />
        </MemoryRouter>
      </I18nextProvider>,
    )
    fireEvent.change(screen.getByTestId('progress-droid-search-input'), {
      target: { value: 'motrak' },
    })
    await waitFor(() => {
      expect(screen.getByTestId('progress-search-path-path-1')).toBeInTheDocument()
    })
    expect(screen.getAllByText(/Renascimento #/).length).toBeGreaterThan(0)
  })

  it('shows never-needed message for unused droids', async () => {
    const never = useAppStore.getState()
    void never
    const { gameData } = await import('../../domain/gameData')
    const { isDroidNeverNeededForProgress } = await import('../../domain/progressDroidSearch')
    const droid = gameData.droids.find((d) => isDroidNeverNeededForProgress(d.id))
    expect(droid).toBeDefined()

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ProgressDroidSearch onNavigateToStep={vi.fn()} />
        </MemoryRouter>
      </I18nextProvider>,
    )
    fireEvent.change(screen.getByTestId('progress-droid-search-input'), {
      target: { value: droid!.name },
    })
    await waitFor(() => {
      expect(screen.getByTestId('progress-droid-search-never')).toBeInTheDocument()
    })
  })

  it('clears results immediately when input is cleared', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ProgressDroidSearch onNavigateToStep={vi.fn()} />
        </MemoryRouter>
      </I18nextProvider>,
    )
    fireEvent.change(screen.getByTestId('progress-droid-search-input'), {
      target: { value: 'motrak' },
    })
    await waitFor(() => {
      expect(screen.getByTestId('progress-search-path-path-1')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('progress-droid-search-clear'))
    expect(screen.queryByTestId('progress-search-path-path-1')).not.toBeInTheDocument()
    expect(screen.queryByText('MO-TRAK')).not.toBeInTheDocument()
  })

  it('navigates when tapping a result row', async () => {
    const onNav = vi.fn()
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ProgressDroidSearch onNavigateToStep={onNav} />
        </MemoryRouter>
      </I18nextProvider>,
    )
    fireEvent.change(screen.getByTestId('progress-droid-search-input'), {
      target: { value: 'motrak' },
    })
    await waitFor(() => {
      expect(screen.getAllByTestId(/^progress-search-hit-path-1-/).length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByTestId(/^progress-search-hit-path-1-/)[0]!)
    expect(onNav).toHaveBeenCalled()
  })
})
