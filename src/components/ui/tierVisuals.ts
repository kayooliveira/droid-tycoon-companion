import { compareTiers } from '../../domain/tiers'
import type { Droid, TierId } from '../../domain/types'

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

export function tierCardAccentClass(tier: TierId): string {
  return `tier-card-accent tier-card-accent--${tier}`
}

export function tierCardGlowClass(tier: TierId): string {
  return `tier-card-glow tier-card-glow--${tier}`
}

/** Highest tier a droid can appear as (for catalog / neutral contexts). */
export function showcaseTierForDroid(d: Pick<Droid, 'tiersAvailable'>): TierId {
  let best: TierId = 'default'
  for (const id of d.tiersAvailable ?? []) {
    if (compareTiers(id, best) > 0) best = id
  }
  return best
}

export const ONBOARDING_HERO_TIERS = ['default', 'gold', 'diamond'] as const satisfies readonly TierId[]
