import { tierMeetsRequired } from './tiers'
import type { InventoryUnit, Requirement, TierId } from './types'

export function inventoryUnitKey(droidId: string, tier: TierId): string {
  return `${droidId}::${tier}`
}

export function totalQuantityForDroid(
  inventory: InventoryUnit[],
  droidId: string,
): number {
  return inventory
    .filter((u) => u.droidId === droidId)
    .reduce((sum, u) => sum + u.quantity, 0)
}

export function countSatisfyingTier(
  inventory: InventoryUnit[],
  droidId: string,
  minTier: TierId,
): number {
  return inventory
    .filter((u) => u.droidId === droidId && tierMeetsRequired(u.tier, minTier))
    .reduce((sum, u) => sum + u.quantity, 0)
}

/** Mutable pool copy for allocation simulations. */
export function cloneInventoryPool(inventory: InventoryUnit[]): InventoryUnit[] {
  return inventory.map((u) => ({ ...u }))
}

export function consumeFromPool(
  pool: InventoryUnit[],
  droidId: string,
  minTier: TierId,
  quantity: number,
): boolean {
  let remaining = quantity
  const eligible = pool
    .map((u, index) => ({ u, index }))
    .filter(({ u }) => u.droidId === droidId && tierMeetsRequired(u.tier, minTier))
    .sort((a, b) => a.u.quantity - b.u.quantity)

  for (const { u, index } of eligible) {
    if (remaining <= 0) break
    const take = Math.min(u.quantity, remaining)
    pool[index]!.quantity -= take
    remaining -= take
  }
  return remaining === 0
}

export function poolRemainingUnits(pool: InventoryUnit[]): InventoryUnit[] {
  return pool.filter((u) => u.quantity > 0)
}

export function canFulfillRequirement(
  inventory: InventoryUnit[],
  req: Requirement,
): boolean {
  return countSatisfyingTier(inventory, req.droidId, req.rarity) >= req.quantity
}
