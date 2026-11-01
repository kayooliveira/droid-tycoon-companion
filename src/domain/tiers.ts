import type { TierId } from './types'

const TIER_ORDER: TierId[] = [
  'default',
  'gold',
  'diamond',
  'rainbow',
  'beskar',
  'galactic',
  'stellar',
  'kyber',
  'scourge',
]

export function tierOrder(tier: TierId): number {
  const idx = TIER_ORDER.indexOf(tier)
  return idx === -1 ? -1 : idx
}

export function tierMeetsRequired(owned: TierId, required: TierId): boolean {
  if (owned === 'scourge') return true
  if (required === 'scourge') return false
  return tierOrder(owned) >= tierOrder(required)
}

export function compareTiers(a: TierId, b: TierId): number {
  return tierOrder(a) - tierOrder(b)
}

export function formatTierName(tier: TierId, labels?: Map<string, string>): string {
  return labels?.get(tier) ?? tier.charAt(0).toUpperCase() + tier.slice(1)
}

export function buildTierLabelMap(
  rarities: Array<{ id: TierId; name: string }>,
): Map<string, string> {
  return new Map(rarities.map((r) => [r.id, r.name]))
}
