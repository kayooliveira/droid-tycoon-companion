import { describe, expect, it, beforeEach } from 'vitest'
import { SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import { useAppStore } from './useAppStore'

describe('superRebirthAdvance', () => {
  beforeEach(() => {
    useAppStore.getState().resetAll()
    useAppStore.getState().setOnboardingComplete(true)
  })

  it('clears inventory when advancing to the next cycle', () => {
    useAppStore.getState().addInventoryUnit('gonk', 'default', 3)
    useAppStore.getState().addInventoryUnit('cb', 'gold', 1)
    expect(useAppStore.getState().inventory.length).toBeGreaterThan(0)
    useAppStore
      .getState()
      .setProgress(SUPER_REBIRTH_UNLOCK_AFTER + 1, SUPER_REBIRTH_UNLOCK_AFTER)
    useAppStore.getState().superRebirthAdvance()
    expect(useAppStore.getState().inventory).toEqual([])
    expect(useAppStore.getState().progress.pathId).toBe('path-2')
    expect(useAppStore.getState().progress.nextRebirth).toBe(1)
    expect(useAppStore.getState().progress.completedOnPath).toBe(0)
  })

  it('does not clear inventory on a normal rebirth advance', () => {
    useAppStore.getState().addInventoryUnit('gonk', 'default', 2)
    useAppStore.getState().completeRebirthAdvance()
    expect(useAppStore.getState().inventory).toHaveLength(1)
    expect(useAppStore.getState().inventory[0]?.quantity).toBe(2)
  })
})
