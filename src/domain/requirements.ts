import { getRebirth } from './gameData'
import {
  canFulfillRequirement,
  cloneInventoryPool,
  consumeFromPool,
  countSatisfyingTier,
} from './inventory'
import { tierMeetsRequired } from './tiers'
import type { InventoryUnit, Requirement, RequirementStatus, TierId } from './types'

export interface RequirementCheck {
  requirement: Requirement
  status: RequirementStatus
  ownedCount: number
  neededCount: number
}

export function evaluateRequirements(
  requirements: Requirement[],
  inventory: InventoryUnit[],
  trackInventory: boolean,
): RequirementCheck[] {
  return requirements.map((requirement) => {
    const ownedCount = countSatisfyingTier(
      inventory,
      requirement.droidId,
      requirement.rarity,
    )
    const neededCount = requirement.quantity

    if (!trackInventory) {
      return {
        requirement,
        status: 'owned' as RequirementStatus,
        ownedCount,
        neededCount,
      }
    }

    let status: RequirementStatus = 'missing'
    if (ownedCount >= neededCount) {
      status = 'ready'
    } else if (ownedCount > 0) {
      status = 'owned'
    }

    return { requirement, status, ownedCount, neededCount }
  })
}

export function rebirthIsComplete(
  pathId: string,
  rebirthNumber: number,
  inventory: InventoryUnit[],
  trackInventory: boolean,
): boolean {
  if (!trackInventory) return false
  const entry = getRebirth(pathId, rebirthNumber)
  if (!entry) return false
  return entry.requirements.every((req) => canFulfillRequirement(inventory, req))
}

export function metRequirementCount(checks: RequirementCheck[]): number {
  return checks.filter((c) => c.status === 'ready').length
}

export function findLowestOwnedTierForDroid(
  inventory: InventoryUnit[],
  droidId: string,
): TierId | null {
  const units = inventory.filter((u) => u.droidId === droidId && u.quantity > 0)
  if (units.length === 0) return null
  return units.reduce<TierId>((best, u) => {
    if (!best) return u.tier
    return tierMeetsRequired(best, u.tier) ? u.tier : best
  }, units[0]!.tier)
}

export function simulateFutureAllocation(
  futureRequirements: Array<{ rebirth: number; requirements: Requirement[] }>,
  inventory: InventoryUnit[],
): {
  pool: InventoryUnit[]
  fulfilledByRebirth: Map<number, boolean>
} {
  const pool = cloneInventoryPool(inventory)
  const fulfilledByRebirth = new Map<number, boolean>()

  for (const { rebirth, requirements } of futureRequirements) {
    let ok = true
    for (const req of requirements) {
      if (!consumeFromPool(pool, req.droidId, req.rarity, req.quantity)) {
        ok = false
      }
    }
    fulfilledByRebirth.set(rebirth, ok)
  }

  return { pool, fulfilledByRebirth }
}
