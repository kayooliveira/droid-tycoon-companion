/**
 * Per-rebirth "what you can sell after this rebirth" for one Path.
 * Shares tier / future-need rules with Sell Center (sellCenter.ts).
 */
import { cycleById, gameData, getPathIds } from './gameData'
import { inventoryUnitKey } from './inventory'
import { collectFutureNeeds, type FutureNeed } from './sellCenter'
import {
  earliestUpgradeRequirement,
  lastRebirthBlockingSell,
} from './sellTierRules'
import type { Confidence, FusionRecipe, TierId } from './types'

export type RebirthSellDisposition = 'sellable' | 'keep' | 'fusionHold' | 'fusionCaution'

export interface RebirthUnitUsage {
  droidId: string
  tier: TierId
  unitKey: string
  /** Last rebirth on this Path where this droid+tier can satisfy a requirement; null if never. */
  lastNeededRebirth: number | null
  /** After finishing this rebirth index, the unit is no longer needed on this Path. */
  sellableAfterRebirth: number
  disposition: RebirthSellDisposition
  fusionRecipeIds: string[]
  otherPathIds: string[]
  /** Set when the unit must stay for a higher tier on a later rebirth. */
  upgradeHint: { rebirth: number; targetTier: TierId } | null
}

function collectRequirementUnitKeys(pathId: string): Array<{ droidId: string; tier: TierId }> {
  const cycle = cycleById.get(pathId)
  if (!cycle) return []
  const seen = new Set<string>()
  const out: Array<{ droidId: string; tier: TierId }> = []
  for (const entry of cycle.rebirths) {
    for (const req of entry.requirements) {
      const key = inventoryUnitKey(req.droidId, req.rarity)
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ droidId: req.droidId, tier: req.rarity })
    }
  }
  return out
}

/** Last rebirth where (droidId, tier) must be kept on this path (tier upgrade chain). */
export function lastRebirthNeedingUnit(
  pathId: string,
  droidId: string,
  tier: TierId,
): number | null {
  return lastRebirthBlockingSell(pathId, droidId, tier)
}

function lastRebirthNeedingDroidOnPath(pathId: string, droidId: string): number | null {
  const cycle = cycleById.get(pathId)
  if (!cycle) return null
  let last = 0
  for (const entry of cycle.rebirths) {
    if (entry.requirements.some((r) => r.droidId === droidId)) {
      last = Math.max(last, entry.rebirth)
    }
  }
  return last === 0 ? null : last
}

function pathsNeedingDroidAfter(
  droidId: string,
  afterRebirth: number,
  excludePathId: string,
): string[] {
  return getPathIds().filter((pathId) => {
    if (pathId === excludePathId) return false
    const last = lastRebirthNeedingDroidOnPath(pathId, droidId)
    return last !== null && last > afterRebirth
  })
}

function fusionNeedsForIngredient(
  droidId: string,
  pathId: string,
  afterRebirth: number,
): { holdIds: string[]; cautionIds: string[] } {
  const holdIds: string[] = []
  const cautionIds: string[] = []

  for (const fusion of gameData.fusions) {
    if (fusion.type !== 'recipe') continue
    const isIngredient = fusion.ingredients.some((i) => i.droidId === droidId)
    if (!isIngredient) continue

    const resultLast = lastRebirthNeedingDroidOnPath(pathId, fusion.resultDroidId)
    if (resultLast === null || resultLast <= afterRebirth) continue

    const confidence: Confidence = fusion.confidence ?? 'partial'
    if (confidence === 'confirmed') {
      holdIds.push(fusion.id)
    } else {
      cautionIds.push(fusion.id)
    }
  }

  return { holdIds, cautionIds }
}

function dispositionForUnit(
  pathId: string,
  droidId: string,
  afterRebirth: number,
  lastNeeded: number | null,
): Pick<RebirthUnitUsage, 'disposition' | 'fusionRecipeIds'> {
  if (lastNeeded !== null && lastNeeded > afterRebirth) {
    return { disposition: 'keep', fusionRecipeIds: [] }
  }

  const { holdIds, cautionIds } = fusionNeedsForIngredient(droidId, pathId, afterRebirth)
  if (holdIds.length > 0) {
    return { disposition: 'fusionHold', fusionRecipeIds: holdIds }
  }
  if (cautionIds.length > 0) {
    return { disposition: 'fusionCaution', fusionRecipeIds: cautionIds }
  }
  return { disposition: 'sellable', fusionRecipeIds: [] }
}

/** All droid+tier units tied to rebirth requirements on this Path, with sell timing. */
export function buildPathUnitUsage(pathId: string): RebirthUnitUsage[] {
  const units = collectRequirementUnitKeys(pathId)
  return units.map(({ droidId, tier }) => {
    const lastNeeded = lastRebirthNeedingUnit(pathId, droidId, tier)
    const sellableAfterRebirth = lastNeeded ?? 0
    const { disposition, fusionRecipeIds } = dispositionForUnit(
      pathId,
      droidId,
      sellableAfterRebirth,
      lastNeeded,
    )
    return {
      droidId,
      tier,
      unitKey: inventoryUnitKey(droidId, tier),
      lastNeededRebirth: lastNeeded,
      sellableAfterRebirth,
      disposition,
      fusionRecipeIds,
      otherPathIds: [],
      upgradeHint: null,
    }
  })
}

function enrichSellableUnits(
  pathId: string,
  afterRebirth: number,
  units: RebirthUnitUsage[],
): RebirthUnitUsage[] {
  return units
    .filter((u) => u.lastNeededRebirth !== null && u.lastNeededRebirth <= afterRebirth)
    .map((u) => {
      const otherPathIds = pathsNeedingDroidAfter(u.droidId, afterRebirth, pathId)
      const { disposition, fusionRecipeIds } = dispositionForUnit(
        pathId,
        u.droidId,
        afterRebirth,
        u.lastNeededRebirth,
      )
      const upgradeHint =
        disposition === 'keep'
          ? earliestUpgradeRequirement(pathId, u.droidId, u.tier, afterRebirth)
          : null
      return { ...u, disposition, fusionRecipeIds, otherPathIds, upgradeHint }
    })
    .filter((u) => u.disposition === 'sellable' || u.disposition === 'fusionHold' || u.disposition === 'fusionCaution')
    .sort((a, b) => a.droidId.localeCompare(b.droidId))
}

/** Cumulative: all units no longer needed from rebirth N+1 onward (after completing N). */
export function unitsSellableAfterRebirth(
  pathId: string,
  afterRebirth: number,
): RebirthUnitUsage[] {
  return enrichSellableUnits(pathId, afterRebirth, buildPathUnitUsage(pathId))
}

/** Delta: units whose last required rebirth is exactly N (newly free after completing rebirth N). */
export function unitsNewlySellableAfterRebirth(
  pathId: string,
  afterRebirth: number,
): RebirthUnitUsage[] {
  if (afterRebirth <= 0) return []
  return enrichSellableUnits(
    pathId,
    afterRebirth,
    buildPathUnitUsage(pathId).filter((u) => u.lastNeededRebirth === afterRebirth),
  )
}

/** Map rebirth index → units newly sellable after that rebirth completes. */
export function sellableUnitsByRebirth(pathId: string): Map<number, RebirthUnitUsage[]> {
  const map = new Map<number, RebirthUnitUsage[]>()
  for (let n = 0; n <= 40; n++) {
    map.set(n, unitsNewlySellableAfterRebirth(pathId, n))
  }
  return map
}

/** Align inventory row with path sell plan at current progress (completed rebirth index). */
export function inventorySafeToSellNow(
  pathId: string,
  completedRebirth: number,
  droidId: string,
  tier: TierId,
): RebirthUnitUsage | null {
  const match = unitsSellableAfterRebirth(pathId, completedRebirth).find(
    (u) => u.droidId === droidId && u.tier === tier,
  )
  return match ?? null
}

export function resultDroidStillNeededAfter(
  pathId: string,
  resultDroidId: string,
  afterRebirth: number,
): boolean {
  const last = lastRebirthNeedingDroidOnPath(pathId, resultDroidId)
  return last !== null && last > afterRebirth
}

export function fusionsRelevantToPath(pathId: string): FusionRecipe[] {
  return gameData.fusions.filter((f) => {
    if (f.type !== 'recipe') return false
    return lastRebirthNeedingDroidOnPath(pathId, f.resultDroidId) !== null
  })
}

/** Re-export for tests comparing with sell-center future needs. */
export { collectFutureNeeds, type FutureNeed }
