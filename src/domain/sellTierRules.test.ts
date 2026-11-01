import { describe, expect, it } from 'vitest'
import { getPathIds, getRebirth } from './gameData'
import {
  earliestUpgradeRequirement,
  isSellableAfterRebirth,
  lastRebirthBlockingSell,
  requirementBlocksSell,
} from './sellTierRules'
import {
  inventorySafeToSellNow,
  sellableUnitsByRebirth,
  unitsNewlySellableAfterRebirth,
  unitsSellableAfterRebirth,
} from './rebirthSellPlan'
import { tierOrder } from './tiers'

describe('sellTierRules', () => {
  it('MO-TRAK Ouro stays blocked until Beskar/Kyber steps on path-3', () => {
    const pathId = 'path-3'
    const lastGold = lastRebirthBlockingSell(pathId, 'mo-trak', 'gold')
    expect(lastGold).not.toBeNull()
    expect(lastGold!).toBeGreaterThanOrEqual(28)

    expect(isSellableAfterRebirth(pathId, 'mo-trak', 'gold', 25)).toBe(false)
    expect(isSellableAfterRebirth(pathId, 'mo-trak', 'gold', 27)).toBe(false)

    const hint = earliestUpgradeRequirement(pathId, 'mo-trak', 'gold', 25)
    expect(hint).not.toBeNull()
    expect(hint!.targetTier).toBe('beskar')
    expect(hint!.rebirth).toBe(28)
  })

  it('higher owned tier stays sellable when only a lower tier is required later', () => {
    const pathId = 'path-1'
    const lastDiamond = lastRebirthBlockingSell(pathId, 'r9', 'diamond')
    expect(lastDiamond).toBe(5)
    expect(isSellableAfterRebirth(pathId, 'r9', 'diamond', 5)).toBe(true)

    const after5 = unitsNewlySellableAfterRebirth(pathId, 5)
    expect(after5.some((u) => u.droidId === 'r9' && u.tier === 'diamond' && u.disposition === 'sellable')).toBe(
      true,
    )
  })

  it('droid with no later requirements on the path is sellable after its last blocking step', () => {
    const pathId = 'path-1'
    const entry = getRebirth(pathId, 2)
    const droidId = entry!.requirements[0]!.droidId
    const tier = entry!.requirements[0]!.rarity
    const last = lastRebirthBlockingSell(pathId, droidId, tier)
    expect(last).not.toBeNull()
    if (last !== null && last < 40) {
      expect(isSellableAfterRebirth(pathId, droidId, tier, last)).toBe(true)
      const delta = unitsNewlySellableAfterRebirth(pathId, last)
      expect(delta.some((u) => u.droidId === droidId)).toBe(true)
    }
  })

  it('after rebirth 40, units still blocking at 40 are not sellable yet', () => {
    const pathId = 'path-1'
    const after40 = unitsSellableAfterRebirth(pathId, 40)
    for (const u of after40) {
      if (u.disposition !== 'sellable') continue
      const last = lastRebirthBlockingSell(pathId, u.droidId, u.tier)
      expect(last).not.toBeNull()
      expect(last!).toBeLessThanOrEqual(40)
    }
  })

  it('regression: no sellable unit has a later requirement at tier >= its own', () => {
    for (const pathId of getPathIds()) {
      for (let after = 0; after <= 40; after++) {
        const sellable = unitsSellableAfterRebirth(pathId, after).filter(
          (u) => u.disposition === 'sellable',
        )
        for (const u of sellable) {
          for (let r = after + 1; r <= 40; r++) {
            const entry = getRebirth(pathId, r)
            if (!entry) continue
            for (const req of entry.requirements) {
              if (req.droidId !== u.droidId) continue
              if (requirementBlocksSell(u.tier, req.rarity)) {
                expect.fail(
                  `${pathId} after #${after}: ${u.droidId} ${u.tier} sellable but blocked by #${r} ${req.rarity}`,
                )
              }
            }
          }
        }
      }
    }
  })

  it('requirementBlocksSell uses canonical tier order only once', () => {
    expect(requirementBlocksSell('gold', 'beskar')).toBe(true)
    expect(requirementBlocksSell('diamond', 'gold')).toBe(false)
    expect(tierOrder('gold')).toBeLessThan(tierOrder('beskar'))
  })
})

describe('inventorySafeToSellNow alignment', () => {
  it('does not mark MO-TRAK gold sellable mid-cycle on path-3', () => {
    const plan = inventorySafeToSellNow('path-3', 25, 'mo-trak', 'gold')
    expect(plan).toBeNull()
  })
})

describe('grouped sell display', () => {
  it('never lists the same droid twice for one rebirth step', () => {
    const map = sellableUnitsByRebirth('path-1')
    for (let n = 1; n <= 40; n++) {
      const ids = (map.get(n) ?? []).map((u) => u.droidId)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('uses held tier at step for multi-tier droids (IG at #39)', () => {
    const units = unitsNewlySellableAfterRebirth('path-1', 39)
    const ig = units.find((u) => u.droidId === 'ig')
    expect(ig).toBeDefined()
    expect(ig!.tier).toBe('kyber')
  })
})

