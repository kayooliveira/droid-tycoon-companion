import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './useAppStore'

describe('switchPath', () => {
  beforeEach(() => {
    useAppStore.getState().resetAll()
    useAppStore.getState().setProgress(6, 5)
  })

  it('changes pathId while keeping rebirth progress by default', () => {
    useAppStore.getState().switchPath('path-3')
    const p = useAppStore.getState().progress
    expect(p.pathId).toBe('path-3')
    expect(p.completedOnPath).toBe(5)
    expect(p.nextRebirth).toBe(6)
  })

  it('can reset rebirth progress when requested', () => {
    useAppStore.getState().switchPath('path-4', { resetProgress: true })
    const p = useAppStore.getState().progress
    expect(p.pathId).toBe('path-4')
    expect(p.completedOnPath).toBe(0)
    expect(p.nextRebirth).toBe(1)
  })

  it('keeps inventory when switching path', () => {
    useAppStore.getState().addInventoryUnit('gonk', 'default', 2)
    useAppStore.getState().switchPath('path-2')
    expect(useAppStore.getState().inventory).toHaveLength(1)
    expect(useAppStore.getState().inventory[0]?.quantity).toBe(2)
  })
})
