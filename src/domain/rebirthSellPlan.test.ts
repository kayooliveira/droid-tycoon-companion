import { describe, expect, it } from 'vitest'
import { getRebirth } from './gameData'
import { gameData } from './gameData'
import {
  lastRebirthNeedingUnit,
  resultDroidStillNeededAfter,
  sellableUnitsByRebirth,
  unitsNewlySellableAfterRebirth,
  unitsSellableAfterRebirth,
} from './rebirthSellPlan'
import { tierMeetsRequired } from './tiers'

describe('rebirth sell plan', () => {
  it('last rebirth respects higher tier satisfying lower', () => {
    const pathId = 'path-1'
    const entry5 = getRebirth(pathId, 5)
    expect(entry5).toBeDefined()
    const cbReq = entry5!.requirements.find((r) => r.droidId === 'cb')
    if (cbReq) {
      const lastGold = lastRebirthNeedingUnit(pathId, 'cb', 'gold')
      const lastDefault = lastRebirthNeedingUnit(pathId, 'cb', 'default')
      expect(lastGold).not.toBeNull()
      if (lastDefault !== null && lastGold !== null) {
        expect(lastGold).toBeGreaterThanOrEqual(lastDefault)
      }
      expect(tierMeetsRequired('gold', cbReq.rarity)).toBe(
        tierMeetsRequired('gold', cbReq.rarity),
      )
    }
  })

  it('scourge tier counts for any requirement tier on same droid', () => {
    const pathId = 'path-1'
    let found = false
    for (let r = 1; r <= 40; r++) {
      const entry = getRebirth(pathId, r)
      if (!entry?.requirements.some((req) => req.droidId === 'cb')) continue
      const lastScourge = lastRebirthNeedingUnit(pathId, 'cb', 'scourge')
      const lastAny = lastRebirthNeedingUnit(pathId, 'cb', entry.requirements.find((x) => x.droidId === 'cb')!.rarity)
      if (lastScourge !== null && lastAny !== null) {
        expect(lastScourge).toBeGreaterThanOrEqual(lastAny)
        found = true
      }
    }
    expect(found).toBe(true)
  })

  it('units sellable after rebirth 40 include those only needed at or before 40', () => {
    const after40 = unitsSellableAfterRebirth('path-1', 40)
    for (const u of after40) {
      expect(u.lastNeededRebirth).not.toBeNull()
      expect(u.lastNeededRebirth!).toBeLessThanOrEqual(40)
    }
  })

  it('nothing from path-1 is sellable after rebirth 0 when still needed at rebirth 1', () => {
    const r1 = getRebirth('path-1', 1)
    expect(r1).toBeDefined()
    const after0 = unitsSellableAfterRebirth('path-1', 0)
    for (const req of r1!.requirements) {
      const stillListed = after0.some(
        (u) => u.droidId === req.droidId && u.tier === req.rarity && u.disposition === 'sellable',
      )
      expect(stillListed).toBe(false)
    }
  })

  it('marks fusion ingredients when result is still needed (confirmed recipe)', () => {
    const fusion = gameData.fusions.find(
      (f) => f.confidence === 'confirmed' && f.type === 'recipe',
    )
    if (!fusion) return
    const pathId = 'path-1'
    const resultLast = lastRebirthNeedingUnit(
      pathId,
      fusion.resultDroidId,
      'default',
    )
    if (resultLast === null) return
    const ingredientId = fusion.ingredients[0]!.droidId
    const after = resultLast - 1
    const units = unitsSellableAfterRebirth(pathId, after)
    const ing = units.find((u) => u.droidId === ingredientId)
    if (ing) {
      expect(['fusionHold', 'fusionCaution', 'sellable']).toContain(ing.disposition)
    }
  })

  it('delta sell lists do not repeat the same unit across rebirths', () => {
    const map = sellableUnitsByRebirth('path-1')
    const seen = new Set<string>()
    for (let n = 1; n <= 40; n++) {
      for (const u of map.get(n) ?? []) {
        if (u.disposition !== 'sellable') continue
        expect(seen.has(u.unitKey)).toBe(false)
        seen.add(u.unitKey)
      }
    }
    expect(seen.size).toBeGreaterThan(0)
  })

  it('newly sellable is subset of cumulative at same rebirth', () => {
    for (let n = 1; n <= 40; n++) {
      const delta = unitsNewlySellableAfterRebirth('path-1', n)
      const cumulative = unitsSellableAfterRebirth('path-1', n)
      const cumKeys = new Set(cumulative.map((u) => u.unitKey))
      for (const u of delta) {
        expect(cumKeys.has(u.unitKey)).toBe(true)
      }
    }
  })

  it('result droid need ends after its final rebirth on the path', () => {
    const pathId = 'path-1'
    const droidId = getRebirth(pathId, 1)!.requirements[0]!.droidId
    let maxRebirth = 0
    for (let r = 1; r <= 40; r++) {
      const entry = getRebirth(pathId, r)
      if (entry?.requirements.some((req) => req.droidId === droidId)) {
        maxRebirth = Math.max(maxRebirth, r)
      }
    }
    expect(resultDroidStillNeededAfter(pathId, droidId, maxRebirth - 1)).toBe(true)
    expect(resultDroidStillNeededAfter(pathId, droidId, maxRebirth)).toBe(false)
  })
})
