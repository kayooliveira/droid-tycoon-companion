/**
 * Shared "Pode vender" tier logic for one Ciclo (path).
 * A droid D at tier T stays until no later step requires D at a tier >= T (canonical order in tiers.ts).
 */
import { cycleById } from './gameData'
import { compareTiers, tierOrder } from './tiers'
import type { TierId } from './types'

/** Later requirement blocks selling a unit held at `ownedTier`. */
export function requirementBlocksSell(ownedTier: TierId, requiredTier: TierId): boolean {
  if (tierOrder(ownedTier) < 0 || tierOrder(requiredTier) < 0) return false
  return tierOrder(requiredTier) >= tierOrder(ownedTier)
}

/** Last rebirth index where (droidId, ownedTier) must still be kept on this path. */
export function lastRebirthBlockingSell(
  pathId: string,
  droidId: string,
  ownedTier: TierId,
): number | null {
  const cycle = cycleById.get(pathId)
  if (!cycle) return null

  let last = 0
  for (const entry of cycle.rebirths) {
    for (const req of entry.requirements) {
      if (req.droidId !== droidId) continue
      if (requirementBlocksSell(ownedTier, req.rarity)) {
        last = Math.max(last, entry.rebirth)
      }
    }
  }
  return last === 0 ? null : last
}

export function isSellableAfterRebirth(
  pathId: string,
  droidId: string,
  tier: TierId,
  afterRebirth: number,
): boolean {
  const last = lastRebirthBlockingSell(pathId, droidId, tier)
  if (last === null) return true
  return last <= afterRebirth
}

/** Next rebirth after `afterRebirth` where the droid must reach a higher tier than `ownedTier`. */
export function earliestUpgradeRequirement(
  pathId: string,
  droidId: string,
  ownedTier: TierId,
  afterRebirth: number,
): { rebirth: number; targetTier: TierId } | null {
  const cycle = cycleById.get(pathId)
  if (!cycle) return null

  let best: { rebirth: number; targetTier: TierId } | null = null
  for (const entry of cycle.rebirths) {
    if (entry.rebirth <= afterRebirth) continue
    for (const req of entry.requirements) {
      if (req.droidId !== droidId) continue
      if (tierOrder(req.rarity) <= tierOrder(ownedTier)) continue
      if (
        !best ||
        entry.rebirth < best.rebirth ||
        (entry.rebirth === best.rebirth && compareTiers(req.rarity, best.targetTier) < 0)
      ) {
        best = { rebirth: entry.rebirth, targetTier: req.rarity }
      }
    }
  }
  return best
}

export function maxFutureRequirementForDroid(
  pathId: string,
  droidId: string,
  fromRebirth: number,
): { tier: TierId; rebirth: number } | null {
  const cycle = cycleById.get(pathId)
  if (!cycle) return null

  let best: { tier: TierId; rebirth: number } | null = null
  for (const entry of cycle.rebirths) {
    if (entry.rebirth < fromRebirth) continue
    for (const req of entry.requirements) {
      if (req.droidId !== droidId) continue
      if (
        !best ||
        compareTiers(req.rarity, best.tier) > 0 ||
        (compareTiers(req.rarity, best.tier) === 0 && entry.rebirth < best.rebirth)
      ) {
        best = { tier: req.rarity, rebirth: entry.rebirth }
      }
    }
  }
  return best
}
