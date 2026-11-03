import type { TierId } from '../../domain/types'

/** Tiers with full visual treatment in the redesign set (excludes scourge styling reuse). */
export const TIER_SHOWCASE_IDS = [
  'default',
  'gold',
  'diamond',
  'rainbow',
  'beskar',
  'galactic',
  'stellar',
  'kyber',
] as const satisfies readonly TierId[]

export type TierShowcaseId = (typeof TIER_SHOWCASE_IDS)[number]

export function tierBadgeClass(tier: TierId): string {
  return `tier-badge--${tier}`
}

export function tierSurfaceClass(tier: TierId): string {
  return `tier-surface--${tier}`
}

export function tierFrameClass(tier: TierId): string {
  return `tier-frame--${tier}`
}

export function tierCardAccentClass(tier: TierId): string {
  return `tier-card-accent tier-card-accent--${tier}`
}
