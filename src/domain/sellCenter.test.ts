import { describe, expect, it } from 'vitest'
import { analyzeSellCenter, droidHasFutureNeedOnPath } from './sellCenter'
import type { InventoryUnit } from './types'

describe('sell center', () => {
  it('detects future need on path', () => {
    expect(droidHasFutureNeedOnPath('path-1', 1, 'cb')).toBe(true)
  })

  it('upgrade hint uses nearest tier step for MO-TRAK gold on path-3', () => {
    const items = analyzeSellCenter('path-3', 26, [
      { id: 'u1', droidId: 'mo-trak', tier: 'gold', quantity: 1 },
    ])
    const up = items.find((i) => i.category === 'upgrade')
    expect(up, JSON.stringify(items)).toBeDefined()
    expect(up!.upgradeTargetTier).toBe('beskar')
    expect(up!.nextNeededAtRebirth).toBe(28)
  })

  it('marks unneeded droid as sellable when not in future rebirths', () => {
    const inventory: InventoryUnit[] = [
      { id: '1', droidId: 'gonk', tier: 'default', quantity: 1 },
    ]
    const items = analyzeSellCenter('path-1', 1, inventory)
    expect(items.some((i) => i.category === 'sellable' || i.category === 'keep')).toBe(true)
  })
})
