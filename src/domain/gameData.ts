import rawData from '../data/gameData.json'
import type { Cycle, Droid, GameData, RebirthEntry, TierId } from './types'

export const gameData = rawData as unknown as GameData

export const droidById = new Map<string, Droid>(
  gameData.droids.map((d) => [d.id, d]),
)

export const cycleById = new Map<string, Cycle>(
  gameData.cycles.map((c) => [c.id, c]),
)

export function getPathIds(): string[] {
  return gameData.cycles.map((c) => c.id)
}

export function getRebirth(
  pathId: string,
  rebirthNumber: number,
): RebirthEntry | undefined {
  const cycle = cycleById.get(pathId)
  return cycle?.rebirths.find((r) => r.rebirth === rebirthNumber)
}

export function getNextPathId(currentPathId: string): string {
  const idx = gameData.cycles.findIndex((c) => c.id === currentPathId)
  if (idx === -1) return 'path-1'
  const next = (idx + 1) % gameData.cycles.length
  return gameData.cycles[next]!.id
}

export function isDataStale(): boolean {
  const updated = new Date(gameData.lastUpdated)
  const staleMs = gameData.staleAfterDays * 24 * 60 * 60 * 1000
  return Date.now() - updated.getTime() > staleMs
}

/** Disputed rebirth alternatives not encoded as separate arrays in source JSON. */
export const DISPUTED_REBIRTH_ALTERNATIVES: Record<
  string,
  {
    note: string
    alternatives: Array<{ labelKey: string; requirements: RebirthEntry['requirements'] }>
  }
> = {
  'path-2:17': {
    note: 'Community guides disagree: three list R7 (Diamond), one lists B2-RP (Diamond).',
    alternatives: [
      {
        labelKey: 'dispute.path2r17AltPrimary',
        requirements: [
          { droidId: 'opti-pod', rarity: 'rainbow' as TierId, quantity: 1 },
          { droidId: 'mono-wlkr', rarity: 'gold' as TierId, quantity: 1 },
          { droidId: 'r7', rarity: 'diamond' as TierId, quantity: 1 },
        ],
      },
      {
        labelKey: 'dispute.path2r17AltAlternate',
        requirements: [
          { droidId: 'opti-pod', rarity: 'rainbow' as TierId, quantity: 1 },
          { droidId: 'mono-wlkr', rarity: 'gold' as TierId, quantity: 1 },
          { droidId: 'b2-rp', rarity: 'diamond' as TierId, quantity: 1 },
        ],
      },
    ],
  },
  'path-6:19': {
    note: 'Proto-Roller tier disputed: four guides say Gold, two say Diamond.',
    alternatives: [
      {
        labelKey: 'dispute.path6r19AltPrimary',
        requirements: [
          { droidId: 'jo9-4mn', rarity: 'diamond' as TierId, quantity: 1 },
          { droidId: 'proto-roller', rarity: 'gold' as TierId, quantity: 1 },
          { droidId: 'r7', rarity: 'diamond' as TierId, quantity: 1 },
        ],
      },
      {
        labelKey: 'dispute.path6r19AltAlternate',
        requirements: [
          { droidId: 'jo9-4mn', rarity: 'diamond' as TierId, quantity: 1 },
          { droidId: 'proto-roller', rarity: 'diamond' as TierId, quantity: 1 },
          { droidId: 'r7', rarity: 'diamond' as TierId, quantity: 1 },
        ],
      },
    ],
  },
}

export function getDisputeKey(pathId: string, rebirth: number): string | null {
  const key = `${pathId}:${rebirth}`
  return key in DISPUTED_REBIRTH_ALTERNATIVES ? key : null
}
