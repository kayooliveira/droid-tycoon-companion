import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { evaluateRequirements } from '../domain/requirements'
import { getRebirth } from '../domain/gameData'
import { initI18n } from '../i18n'
import { useAppStore } from '../store/useAppStore'
import { RequirementCard } from './RequirementCard'
import { ToastProvider } from './ToastProvider'

const i18n = initI18n('en')

function renderCard() {
  const entry = getRebirth('path-1', 8)!
  const inventory = useAppStore.getState().inventory
  const check = evaluateRequirements(entry.requirements, inventory, true)[0]!
  return render(
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <RequirementCard check={check} />
      </ToastProvider>
    </I18nextProvider>,
  )
}

describe('RequirementInventoryControls', () => {
  beforeEach(() => {
    cleanup()
    useAppStore.getState().resetAll()
    useAppStore.getState().setOnboardingComplete(true)
    useAppStore.getState().updateSettings({ trackInventory: true })
  })

  afterEach(() => {
    cleanup()
  })

  it('shows add only when none owned', () => {
    renderCard()
    expect(screen.getByTestId('requirement-inventory-add')).toBeInTheDocument()
    expect(screen.queryByTestId('requirement-inventory-remove')).not.toBeInTheDocument()
  })

  it('x removes unit and clears inventory row', () => {
    const req = getRebirth('path-1', 8)!.requirements[0]!
    useAppStore.getState().addInventoryUnit(req.droidId, req.rarity, 1)
    renderCard()
    fireEvent.click(screen.getByTestId('requirement-inventory-remove'))
    expect(useAppStore.getState().inventory).toHaveLength(0)
  })

  it('undo restores inventory after add', () => {
    renderCard()
    fireEvent.click(screen.getByTestId('requirement-inventory-add'))
    expect(useAppStore.getState().inventory.length).toBe(1)
    fireEvent.click(screen.getByTestId('toast-action'))
    expect(useAppStore.getState().inventory).toHaveLength(0)
  })

  it('undo restores inventory after remove', () => {
    const req = getRebirth('path-1', 8)!.requirements[0]!
    useAppStore.getState().addInventoryUnit(req.droidId, req.rarity, 1)
    renderCard()
    fireEvent.click(screen.getByTestId('requirement-inventory-remove'))
    expect(useAppStore.getState().inventory).toHaveLength(0)
    fireEvent.click(screen.getByTestId('toast-action'))
    expect(useAppStore.getState().inventory).toHaveLength(1)
  })

  it('recomputes readiness after undo', () => {
    const entry = getRebirth('path-1', 8)!
    renderCard()
    fireEvent.click(screen.getByTestId('requirement-inventory-add'))
    let checks = evaluateRequirements(entry.requirements, useAppStore.getState().inventory, true)
    expect(checks.some((c) => c.status === 'ready')).toBe(true)
    fireEvent.click(screen.getByTestId('toast-action'))
    checks = evaluateRequirements(entry.requirements, useAppStore.getState().inventory, true)
    expect(checks.every((c) => c.status !== 'ready')).toBe(true)
  })
})
