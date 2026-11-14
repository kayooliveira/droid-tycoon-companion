import type { TierId } from '../../domain/types'
import type { ParticlePalette } from './superRebirthParticleCanvas'

const CELEBRATION_TIERS: TierId[] = [
  'default',
  'diamond',
  'gold',
  'beskar',
  'galactic',
  'stellar',
  'kyber',
]

function parseRgb(css: string): string | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return null
  return `rgb(${m[1]}, ${m[2]}, ${m[3]})`
}

export function readTierCelebrationPalette(root: ParentNode): ParticlePalette {
  const host = root.querySelector('[data-sr-tier-samples]')
  const accent =
    parseRgb(getComputedStyle(document.documentElement).getPropertyValue('--c-accent-graph')) ??
    'rgb(200, 242, 90)'

  if (!host) {
    return { fills: [accent], accent, flash: 'rgb(255,255,255)' }
  }

  const fills: string[] = []
  for (const tier of CELEBRATION_TIERS) {
    const el = host.querySelector(`[data-tier="${tier}"]`)
    if (!el || !(el instanceof HTMLElement)) continue
    const bg = getComputedStyle(el).backgroundColor
    const rgb = parseRgb(bg)
    if (rgb) fills.push(rgb)
  }

  return {
    fills: fills.length ? fills : [accent],
    accent,
    flash: 'rgb(255,255,255)',
  }
}
