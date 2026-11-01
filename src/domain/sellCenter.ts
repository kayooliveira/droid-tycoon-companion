/**
 * Sell Center analyzes remaining rebirths on the **current path only** (from next rebirth through 40).
 * Super Rebirth resets most progress; future paths are out of scope here — see Settings for notes.
 */
import { cycleById, droidById } from './gameData'
import {
  cloneInventoryPool,
  consumeFromPool,
  poolRemainingUnits,
} from './inventory'
import { maxFutureRequirementForDroid } from './sellTierRules'
import { tierMeetsRequired } from './tiers'
import type { InventoryUnit, TierId } from './types'

export type SellCategory = 'keep' | 'sellable' | 'upgrade'

export interface FutureNeed {
  rebirth: number
  droidId: string
  minTier: TierId
  quantity: number
}

export type SellReasonKey =
  | 'sell.sellableNotNeeded'
  | 'sell.sellableExtra'
  | 'sell.keepRebirth'
  | 'sell.upgradeRebirth'

export interface SellAnalysisItem {
  unitId: string
  droidId: string
  tier: TierId
  quantity: number
  category: SellCategory
  reasonKey: SellReasonKey
  reasonParams: Record<string, string | number>
  nextNeededAtRebirth: number | null
  upgradeTargetTier: TierId | null
}

export function collectFutureNeeds(
  pathId: string,
  fromRebirth: number,
): FutureNeed[] {
  const cycle = cycleById.get(pathId)
  if (!cycle) return []

  const needs: FutureNeed[] = []
  for (const entry of cycle.rebirths) {
    if (entry.rebirth < fromRebirth) continue
    for (const req of entry.requirements) {
      needs.push({
        rebirth: entry.rebirth,
        droidId: req.droidId,
        minTier: req.rarity,
        quantity: req.quantity,
      })
    }
  }
  return needs
}

function earliestRebirthNeed(
  needs: FutureNeed[],
  droidId: string,
  minTier: TierId,
): number | null {
  const match = needs
    .filter(
      (n) =>
        n.droidId === droidId && tierMeetsRequired(minTier, n.minTier) === false,
    )
    .sort((a, b) => a.rebirth - b.rebirth)
  if (match.length === 0) {
    const any = needs
      .filter((n) => n.droidId === droidId)
      .sort((a, b) => a.rebirth - b.rebirth)
    return any[0]?.rebirth ?? null
  }
  return match[0]!.rebirth
}

export function analyzeSellCenter(
  pathId: string,
  nextRebirth: number,
  inventory: InventoryUnit[],
): SellAnalysisItem[] {
  const cycle = cycleById.get(pathId)
  if (!cycle) return []

  const futureRebirths = cycle.rebirths
    .filter((r) => r.rebirth >= nextRebirth)
    .map((r) => ({ rebirth: r.rebirth, requirements: r.requirements }))

  const pool = cloneInventoryPool(inventory)
  for (const { requirements } of futureRebirths) {
    for (const req of requirements) {
      consumeFromPool(pool, req.droidId, req.rarity, req.quantity)
    }
  }

  const remaining = poolRemainingUnits(pool)
  const futureNeeds = collectFutureNeeds(pathId, nextRebirth)

  const items: SellAnalysisItem[] = []

  for (const unit of inventory) {
    if (unit.quantity <= 0) continue
    const droid = droidById.get(unit.droidId)
    const name = droid?.name ?? unit.droidId

    const maxNeed = maxFutureRequirementForDroid(pathId, unit.droidId, nextRebirth)
    const leftover = remaining.find(
      (r) => r.id === unit.id || (r.droidId === unit.droidId && r.tier === unit.tier),
    )
    const surplusQty = leftover?.quantity ?? 0

    if (!maxNeed) {
      items.push({
        unitId: unit.id,
        droidId: unit.droidId,
        tier: unit.tier,
        quantity: unit.quantity,
        category: 'sellable',
        reasonKey: 'sell.sellableNotNeeded',
        reasonParams: { name, qty: unit.quantity },
        nextNeededAtRebirth: null,
        upgradeTargetTier: null,
      })
      continue
    }

    const needsUpgrade = !tierMeetsRequired(unit.tier, maxNeed.tier)
    const nextRebirthNeed = earliestRebirthNeed(futureNeeds, unit.droidId, unit.tier)

    if (needsUpgrade) {
      items.push({
        unitId: unit.id,
        droidId: unit.droidId,
        tier: unit.tier,
        quantity: unit.quantity,
        category: 'upgrade',
        reasonKey: 'sell.upgradeRebirth',
        reasonParams: { name, tier: maxNeed.tier, rebirth: maxNeed.rebirth },
        nextNeededAtRebirth: maxNeed.rebirth,
        upgradeTargetTier: maxNeed.tier,
      })
      continue
    }

    if (surplusQty > 0) {
      items.push({
        unitId: unit.id,
        droidId: unit.droidId,
        tier: unit.tier,
        quantity: surplusQty,
        category: 'sellable',
        reasonKey: 'sell.sellableExtra',
        reasonParams: { name, qty: surplusQty },
        nextNeededAtRebirth: null,
        upgradeTargetTier: null,
      })
      if (unit.quantity > surplusQty) {
        items.push({
          unitId: unit.id,
          droidId: unit.droidId,
          tier: unit.tier,
          quantity: unit.quantity - surplusQty,
          category: 'keep',
          reasonKey: 'sell.keepRebirth',
          reasonParams: { name, rebirth: nextRebirthNeed ?? maxNeed.rebirth },
          nextNeededAtRebirth: nextRebirthNeed ?? maxNeed.rebirth,
          upgradeTargetTier: null,
        })
      }
      continue
    }

    items.push({
      unitId: unit.id,
      droidId: unit.droidId,
      tier: unit.tier,
      quantity: unit.quantity,
      category: 'keep',
      reasonKey: 'sell.keepRebirth',
      reasonParams: { name, rebirth: nextRebirthNeed ?? maxNeed.rebirth },
      nextNeededAtRebirth: nextRebirthNeed ?? maxNeed.rebirth,
      upgradeTargetTier: null,
    })
  }

  return items.sort((a, b) => a.droidId.localeCompare(b.droidId))
}

export function summarizeSellCenter(items: SellAnalysisItem[]): {
  keep: number
  sellable: number
  upgrade: number
} {
  return {
    keep: items.filter((i) => i.category === 'keep').reduce((s, i) => s + i.quantity, 0),
    sellable: items
      .filter((i) => i.category === 'sellable')
      .reduce((s, i) => s + i.quantity, 0),
    upgrade: items
      .filter((i) => i.category === 'upgrade')
      .reduce((s, i) => s + i.quantity, 0),
  }
}

export function droidHasFutureNeedOnPath(
  pathId: string,
  fromRebirth: number,
  droidId: string,
): boolean {
  return collectFutureNeeds(pathId, fromRebirth).some((n) => n.droidId === droidId)
}
