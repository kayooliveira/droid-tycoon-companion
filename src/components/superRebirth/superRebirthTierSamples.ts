import type { TierId } from '../../domain/types'

const CELEBRATION_TIERS: TierId[] = [
  'default',
  'diamond',
  'gold',
  'beskar',
  'galactic',
  'stellar',
  'kyber',
]

export function readTierCelebrationColors(root: ParentNode): string[] {
  const host = root.querySelector('[data-sr-tier-samples]')
  if (!host) return ['var(--c-accent-graph)', 'var(--c-accent-text)', 'var(--c-text)']

  const colors: string[] = []
  for (const tier of CELEBRATION_TIERS) {
    const el = host.querySelector(`[data-tier="${tier}"]`)
    if (!el || !(el instanceof HTMLElement)) continue
    const bg = getComputedStyle(el).backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)') {
      colors.push(bg)
    }
  }
  return colors.length > 0 ? colors : ['var(--c-accent-graph)']
}
