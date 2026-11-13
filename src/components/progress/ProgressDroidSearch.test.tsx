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

  it('keeps the same input element identity across several keystrokes', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ProgressDroidSearch onNavigateToStep={vi.fn()} />
        </MemoryRouter>
      </I18nextProvider>,
    )
    const input = screen.getByTestId('progress-droid-search-input')
    const identity = input
    fireEvent.change(input, { target: { value: 'm' } })
    fireEvent.change(input, { target: { value: 'mo' } })
    fireEvent.change(input, { target: { value: 'mot' } })
    fireEvent.change(input, { target: { value: 'motr' } })
    await waitFor(() => {
      expect(screen.getByTestId('progress-droid-search-input')).toBe(identity)
    })
    expect(screen.getByTestId('progress-droid-search-input')).toHaveValue('motr')
  })

  it('finds MO-TRAK from motrak after selecting a match', async () => {
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
    const pick = await screen.findByTestId('progress-search-pick-mo-trak')
    fireEvent.click(pick)
    await waitFor(() => {
      expect(screen.getByTestId('progress-search-path-path-1')).toBeInTheDocument()
    })
    expect(screen.getAllByText(/Renascimento #/).length).toBeGreaterThan(0)
  })

  it('shows never-needed message for unused droids', async () => {
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
    const pick = await screen.findByTestId(`progress-search-pick-${droid!.id}`)
    fireEvent.click(pick)
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
    await screen.findByTestId('progress-search-pick-mo-trak')
    fireEvent.click(screen.getByTestId('progress-droid-search-clear'))
    expect(screen.queryByTestId('progress-search-path-path-1')).not.toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
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
    fireEvent.click(await screen.findByTestId('progress-search-pick-mo-trak'))
    await waitFor(() => {
      expect(screen.getAllByTestId(/^progress-search-hit-path-1-/).length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByTestId(/^progress-search-hit-path-1-/)[0]!)
    expect(onNav).toHaveBeenCalled()
  })
})
