import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initI18n } from '../../i18n'
import { useAppStore } from '../../store/useAppStore'
import { ProgressRebirthList } from './ProgressRebirthList'

const i18n = initI18n('en')

const STEPS = [1, 2, 3]

function renderList(persisted?: boolean) {
  if (persisted !== undefined) {
    useAppStore.getState().updateSettings({ progressListAllExpanded: persisted })
  }
  return render(
    <I18nextProvider i18n={i18n}>
      <ProgressRebirthList
        pathId="path-1"
        rebirthNumbers={STEPS}
        nextRebirth={2}
        inventory={[]}
        trackInventory={false}
      />
    </I18nextProvider>,
  )
}

describe('ProgressRebirthList', () => {
  beforeEach(() => {
    cleanup()
    useAppStore.getState().resetAll()
    useAppStore.getState().setOnboardingComplete(true)
  })

  afterEach(() => {
    cleanup()
  })

  it('defaults all items expanded', () => {
    renderList()
    expect(screen.getByTestId('progress-list-expand-all')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('progress-list-item-1')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('progress-list-item-3')).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggle all collapses and expands', () => {
    renderList()
    fireEvent.click(screen.getByTestId('progress-list-expand-all'))
    expect(screen.getByTestId('progress-list-expand-all')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Expand all')).toBeInTheDocument()
    expect(screen.getByTestId('progress-list-item-1')).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(screen.getByTestId('progress-list-expand-all'))
    expect(screen.getByTestId('progress-list-item-1')).toHaveAttribute('aria-expanded', 'true')
  })

  it('persists collapse preference in settings', () => {
    renderList()
    fireEvent.click(screen.getByTestId('progress-list-expand-all'))
    expect(useAppStore.getState().settings.progressListAllExpanded).toBe(false)
  })

  it('respects persisted collapsed preference on mount', () => {
    renderList(false)
    expect(screen.getByTestId('progress-list-item-2')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })

  it('individual toggle still works', () => {
    renderList()
    fireEvent.click(screen.getByTestId('progress-list-item-2'))
    expect(screen.getByTestId('progress-list-item-2')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('progress-list-item-1')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Collapse all')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('progress-list-expand-all'))
    expect(screen.getByTestId('progress-list-item-1')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })
})
