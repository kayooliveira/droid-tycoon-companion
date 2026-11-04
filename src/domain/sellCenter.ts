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
import {
  isKeepForLaterRebirth,
  isUseOnNextRebirth,
  quantityNeededAtRebirth,
} from './rebirthSellPlan'
import { earliestUpgradeRequirement, maxFutureRequirementForDroid } from './sellTierRules'
import { tierMeetsRequired } from './tiers'
import type { InventoryUnit, TierId } from './types'

export type SellCategory = 'keep' | 'sellable' | 'upgrade' | 'useNext'

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
  | 'sell.useNextNote'

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

/** Rebirths strictly after `afterRebirth` on the active cycle. */
export function collectFutureNeedsAfter(
  pathId: string,
  afterRebirth: number,
): FutureNeed[] {
  return collectFutureNeeds(pathId, afterRebirth + 1)
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

function earliestRebirthNeedAfter(
  needs: FutureNeed[],
  droidId: string,
  minTier: TierId,
  afterRebirth: number,
): number | null {
  const filtered = needs.filter((n) => n.rebirth > afterRebirth)
  return earliestRebirthNeed(filtered, droidId, minTier)
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
  const futureNeedsAfterNext = collectFutureNeedsAfter(pathId, nextRebirth)

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
    const laterRebirthNeed = earliestRebirthNeedAfter(
      futureNeeds,
      unit.droidId,
      unit.tier,
      nextRebirth,
    )

    if (needsUpgrade) {
      const completedRebirth = Math.max(0, nextRebirth - 1)
      const nextStep = earliestUpgradeRequirement(
        pathId,
        unit.droidId,
        unit.tier,
        completedRebirth,
      )
      const hintTier = nextStep?.targetTier ?? maxNeed.tier
      const hintRebirth = nextStep?.rebirth ?? maxNeed.rebirth
      items.push({
        unitId: unit.id,
        droidId: unit.droidId,
        tier: unit.tier,
        quantity: unit.quantity,
        category: 'upgrade',
        reasonKey: 'sell.upgradeRebirth',
        reasonParams: { name, tier: hintTier, rebirth: hintRebirth },
        nextNeededAtRebirth: hintRebirth,
        upgradeTargetTier: hintTier,
      })
      continue
    }

    if (isUseOnNextRebirth(pathId, unit.droidId, unit.tier, nextRebirth)) {
      const neededAtNext = quantityNeededAtRebirth(
        pathId,
        nextRebirth,
        unit.droidId,
        unit.tier,
      )
      const reserveQty = Math.min(unit.quantity, neededAtNext)
      if (reserveQty > 0) {
        items.push({
          unitId: unit.id,
          droidId: unit.droidId,
          tier: unit.tier,
          quantity: reserveQty,
          category: 'useNext',
          reasonKey: 'sell.useNextNote',
          reasonParams: { name, rebirth: nextRebirth },
          nextNeededAtRebirth: nextRebirth,
          upgradeTargetTier: null,
        })
      }
      const extraQty = unit.quantity - reserveQty
      if (extraQty > 0) {
        items.push({
          unitId: unit.id,
          droidId: unit.droidId,
          tier: unit.tier,
          quantity: extraQty,
          category: 'sellable',
          reasonKey: 'sell.sellableExtra',
          reasonParams: { name, qty: extraQty },
          nextNeededAtRebirth: null,
          upgradeTargetTier: null,
        })
      }
      continue
    }

    if (surplusQty > 0 && !isKeepForLaterRebirth(pathId, unit.droidId, unit.tier, nextRebirth)) {
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
        const keepRebirth = laterRebirthNeed ?? maxNeed.rebirth
        items.push({
          unitId: unit.id,
          droidId: unit.droidId,
          tier: unit.tier,
          quantity: unit.quantity - surplusQty,
          category: 'keep',
          reasonKey: 'sell.keepRebirth',
          reasonParams: { name, rebirth: keepRebirth },
          nextNeededAtRebirth: keepRebirth,
          upgradeTargetTier: null,
        })
      }
      continue
    }

    if (isKeepForLaterRebirth(pathId, unit.droidId, unit.tier, nextRebirth)) {
      const keepRebirth =
        laterRebirthNeed ??
        earliestRebirthNeed(futureNeedsAfterNext, unit.droidId, unit.tier) ??
        maxNeed.rebirth
      items.push({
        unitId: unit.id,
        droidId: unit.droidId,
        tier: unit.tier,
        quantity: unit.quantity,
        category: 'keep',
        reasonKey: 'sell.keepRebirth',
        reasonParams: { name, rebirth: keepRebirth },
        nextNeededAtRebirth: keepRebirth,
        upgradeTargetTier: null,
      })
      continue
    }

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
  }

  return items.sort((a, b) => a.droidId.localeCompare(b.droidId))
}

export function summarizeSellCenter(items: SellAnalysisItem[]): {
  keep: number
  sellable: number
  upgrade: number
  useNext: number
} {
  return {
    keep: items.filter((i) => i.category === 'keep').reduce((s, i) => s + i.quantity, 0),
    sellable: items
      .filter((i) => i.category === 'sellable')
      .reduce((s, i) => s + i.quantity, 0),
    upgrade: items
      .filter((i) => i.category === 'upgrade')
      .reduce((s, i) => s + i.quantity, 0),
    useNext: items.filter((i) => i.category === 'useNext').reduce((s, i) => s + i.quantity, 0),
  }
}

export function droidHasFutureNeedOnPath(
  pathId: string,
  fromRebirth: number,
  droidId: string,
): boolean {
  return collectFutureNeedsAfter(pathId, fromRebirth).some((n) => n.droidId === droidId)
}
