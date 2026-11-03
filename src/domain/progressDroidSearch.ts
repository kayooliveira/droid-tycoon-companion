import { cycleById, DISPUTED_REBIRTH_ALTERNATIVES, gameData, getPathIds } from './gameData'
import {
  fusionNeedsForIngredient,
  lastRebirthNeedingDroidOnPath,
} from './rebirthSellPlan'
import type { ProgressState } from './progress'
import type { TierId } from './types'

export type ProgressNeedKind = 'requirement' | 'fusion' | 'disputed'

export interface ProgressDroidNeedHit {
  pathId: string
  rebirth: number
  tier: TierId
  quantity: number
  kind: ProgressNeedKind
  /** Set for fusion ingredient rows (result droid id). */
  fusionResultDroidId?: string
  fusionId?: string
}

export type RebirthNeedStatus = 'done' | 'current' | 'upcoming'

export function pathIdFromCycleNumber(ciclo: number): string {
  const cycle = gameData.cycles[ciclo - 1]
  return cycle?.id ?? 'path-1'
}

export function cycleNumberFromPathId(pathId: string): number {
  const idx = gameData.cycles.findIndex((c) => c.id === pathId)
  return idx >= 0 ? idx + 1 : 1
}

function pushRequirementHits(droidId: string, out: ProgressDroidNeedHit[]) {
  for (const cycle of gameData.cycles) {
    for (const entry of cycle.rebirths) {
      for (const req of entry.requirements) {
        if (req.droidId !== droidId) continue
        out.push({
          pathId: cycle.id,
          rebirth: entry.rebirth,
          tier: req.rarity,
          quantity: req.quantity ?? 1,
          kind: 'requirement',
        })
      }
    }
  }

  for (const [key, dispute] of Object.entries(DISPUTED_REBIRTH_ALTERNATIVES)) {
    const [pathId, rebirthStr] = key.split(':')
    const rebirth = Number(rebirthStr)
    if (!pathId || !rebirth) continue
    for (const alt of dispute.alternatives) {
      for (const req of alt.requirements) {
        if (req.droidId !== droidId) continue
        out.push({
          pathId,
          rebirth,
          tier: req.rarity,
          quantity: req.quantity ?? 1,
          kind: 'disputed',
        })
      }
    }
  }
}

function pushFusionHits(droidId: string, out: ProgressDroidNeedHit[]) {
  for (const fusion of gameData.fusions) {
    if (fusion.type !== 'recipe') continue
    if (!fusion.ingredients.some((i) => i.droidId === droidId)) continue

    for (const pathId of getPathIds()) {
      const resultLast = lastRebirthNeedingDroidOnPath(pathId, fusion.resultDroidId)
      if (resultLast === null) continue

      const cycle = cycleById.get(pathId)
      if (!cycle) continue
      for (const entry of cycle.rebirths) {
        if (entry.rebirth > resultLast) continue
        const needsResult = entry.requirements.some((r) => r.droidId === fusion.resultDroidId)
        if (!needsResult) continue
        const { holdIds, cautionIds } = fusionNeedsForIngredient(droidId, pathId, entry.rebirth - 1)
        if (holdIds.includes(fusion.id) || cautionIds.includes(fusion.id)) {
          const ing = fusion.ingredients.find((i) => i.droidId === droidId)
          out.push({
            pathId,
            rebirth: entry.rebirth,
            tier: 'default' as TierId,
            quantity: ing?.quantity ?? 1,
            kind: 'fusion',
            fusionResultDroidId: fusion.resultDroidId,
            fusionId: fusion.id,
          })
        }
      }
    }
  }
}

export function collectDroidProgressNeeds(droidId: string): ProgressDroidNeedHit[] {
  const hits: ProgressDroidNeedHit[] = []
  pushRequirementHits(droidId, hits)
  pushFusionHits(droidId, hits)
  return dedupeHits(hits)
}

function dedupeHits(hits: ProgressDroidNeedHit[]): ProgressDroidNeedHit[] {
  const seen = new Set<string>()
  const out: ProgressDroidNeedHit[] = []
  for (const h of hits) {
    const key = `${h.pathId}:${h.rebirth}:${h.tier}:${h.kind}:${h.fusionId ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(h)
  }
  return out
}

export function rebirthNeedStatus(
  pathId: string,
  rebirth: number,
  progress: ProgressState,
): RebirthNeedStatus {
  if (pathId !== progress.pathId) return 'upcoming'
  if (rebirth < progress.nextRebirth) return 'done'
  if (rebirth === progress.nextRebirth) return 'current'
  return 'upcoming'
}

export function nextUpcomingNeedRebirth(
  hits: ProgressDroidNeedHit[],
  progress: ProgressState,
): ProgressDroidNeedHit | null {
  const onPath = hits.filter((h) => h.pathId === progress.pathId && h.rebirth >= progress.nextRebirth)
  if (onPath.length > 0) {
    return onPath.reduce((best, h) => (h.rebirth < best.rebirth ? h : best))
  }
  const future = hits.filter((h) => h.rebirth >= 1)
  if (future.length === 0) return null
  return future.reduce((best, h) => {
    if (h.pathId === progress.pathId && best.pathId !== progress.pathId) return h
    if (best.pathId === progress.pathId && h.pathId !== progress.pathId) return best
    if (h.rebirth < best.rebirth) return h
    if (h.rebirth === best.rebirth && h.pathId.localeCompare(best.pathId) < 0) return h
    return best
  })
}

export function groupNeedsByPath(
  hits: ProgressDroidNeedHit[],
  progress: ProgressState,
): Array<{ pathId: string; hits: ProgressDroidNeedHit[] }> {
  const byPath = new Map<string, ProgressDroidNeedHit[]>()
  for (const h of hits) {
    const list = byPath.get(h.pathId) ?? []
    list.push(h)
    byPath.set(h.pathId, list)
  }
  for (const list of byPath.values()) {
    list.sort((a, b) => a.rebirth - b.rebirth || a.tier.localeCompare(b.tier))
  }
  const pathIds = [...byPath.keys()].sort((a, b) => {
    if (a === progress.pathId) return -1
    if (b === progress.pathId) return 1
    return cycleNumberFromPathId(a) - cycleNumberFromPathId(b)
  })
  return pathIds.map((pathId) => ({ pathId, hits: byPath.get(pathId)! }))
}

export function isDroidNeverNeededForProgress(droidId: string): boolean {
  return collectDroidProgressNeeds(droidId).length === 0
}

export function canSellDroidEverywhere(droidId: string, tier: TierId = 'default'): boolean {
  for (const pathId of getPathIds()) {
    const last = lastRebirthNeedingDroidOnPath(pathId, droidId)
    if (last !== null) {
      const cycle = cycleById.get(pathId)
      const needsTier = cycle?.rebirths.some((entry) =>
        entry.requirements.some((r) => r.droidId === droidId && r.rarity === tier),
      )
      if (needsTier) return false
    }
    const { holdIds, cautionIds } = fusionNeedsForIngredient(droidId, pathId, 0)
    if (holdIds.length > 0 || cautionIds.length > 0) return false
  }
  return isDroidNeverNeededForProgress(droidId)
}
