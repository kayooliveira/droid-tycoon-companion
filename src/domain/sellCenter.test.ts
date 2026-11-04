import { describe, expect, it } from 'vitest'
import { isProgressRequirementSellable } from './rebirthSellPlan'
import { analyzeSellCenter, droidHasFutureNeedOnPath } from './sellCenter'
import type { InventoryUnit, TierId } from './types'

const PATH = 'path-3'
const NEXT = 26

function unit(droidId: string, tier: TierId, quantity = 1): InventoryUnit {
  return { id: `${droidId}-${tier}`, droidId, tier, quantity }
}

function primaryCategory(droidId: string, tier: TierId, quantity = 1) {
  const items = analyzeSellCenter(PATH, NEXT, [unit(droidId, tier, quantity)])
  return items[0]?.category
}

describe('sell center', () => {
  it('detects future need on path (strictly after from rebirth)', () => {
    expect(droidHasFutureNeedOnPath('path-1', 1, 'cb')).toBe(false)
    expect(droidHasFutureNeedOnPath('path-1', 2, 'cb')).toBe(false)
    expect(droidHasFutureNeedOnPath(PATH, NEXT, 'snow-mouse')).toBe(false)
    expect(droidHasFutureNeedOnPath(PATH, NEXT, 'lep')).toBe(true)
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

  describe('Progresso alignment at cycle 3 rebirth #26', () => {
    it('Snow Mouse → useNext (Progresso Pode vender)', () => {
      expect(isProgressRequirementSellable(PATH, 'snow-mouse', 'rainbow', NEXT)).toBe(true)
      const items = analyzeSellCenter(PATH, NEXT, [unit('snow-mouse', 'rainbow')])
      expect(items.some((i) => i.category === 'useNext')).toBe(true)
      expect(items.some((i) => i.category === 'keep')).toBe(false)
      const note = items.find((i) => i.category === 'useNext')
      expect(note!.reasonKey).toBe('sell.useNextNote')
      expect(note!.reasonParams.rebirth).toBe(NEXT)
    })

    it('Snow Mouse extra copies are sellable now', () => {
      const items = analyzeSellCenter(PATH, NEXT, [unit('snow-mouse', 'rainbow', 2)])
      expect(items.find((i) => i.category === 'useNext')?.quantity).toBe(1)
      expect(items.find((i) => i.category === 'sellable')?.quantity).toBe(1)
    })

    it('LEP → not sellable (Progresso Não venda, Vender upgrade/keep)', () => {
      expect(isProgressRequirementSellable(PATH, 'lep', 'gold', NEXT)).toBe(false)
      const cat = primaryCategory('lep', 'gold')
      expect(['keep', 'upgrade']).toContain(cat)
      expect(cat).not.toBe('useNext')
    })

    it('TRI-TEK → not sellable (Progresso Não venda, Vender upgrade/keep)', () => {
      expect(isProgressRequirementSellable(PATH, 'tri-tek', 'diamond', NEXT)).toBe(false)
      const cat = primaryCategory('tri-tek', 'diamond')
      expect(['keep', 'upgrade']).toContain(cat)
      expect(cat).not.toBe('useNext')
    })

    it('CB (not on this cycle) → Vender / sellable', () => {
      expect(isProgressRequirementSellable(PATH, 'cb', 'default', NEXT)).toBe(true)
      expect(primaryCategory('cb', 'default')).toBe('sellable')
    })
  })

  describe('last rebirth of cycle', () => {
    it('MO-TRAK Kyber at path-3 #40 → useNext aligned with Progresso', () => {
      const next = 40
      expect(isProgressRequirementSellable(PATH, 'mo-trak', 'kyber', next)).toBe(true)
      const items = analyzeSellCenter(PATH, next, [unit('mo-trak', 'kyber')])
      expect(items[0]?.category).toBe('useNext')
    })
  })
})
