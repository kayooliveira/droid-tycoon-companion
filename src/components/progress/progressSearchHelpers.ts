import type { TFunction } from 'i18next'
import type { Droid } from '../../domain/types'
import {
  collectDroidProgressNeeds,
  cycleNumberFromPathId,
  nextUpcomingNeedRebirth,
  type ProgressDroidNeedHit,
} from '../../domain/progressDroidSearch'
import type { ProgressState } from '../../domain/progress'
import { formatTierName } from '../../domain/tiers'

export function nextUseForDroid(
  droidId: string,
  progress: ProgressState,
): ProgressDroidNeedHit | null {
  const needs = collectDroidProgressNeeds(droidId)
  if (needs.length === 0) return null
  return nextUpcomingNeedRebirth(needs, progress)
}

export function nextUsePreviewLine(
  droidId: string,
  progress: ProgressState,
  tierLabels: Map<string, string>,
  t: TFunction,
): string {
  const hit = nextUseForDroid(droidId, progress)
  if (!hit) return t('progress.search.neverNeededShort')
  const tier = formatTierName(hit.tier, tierLabels)
  if (hit.pathId === progress.pathId) {
    return t('progress.search.nextUseInCurrent', { n: hit.rebirth, tier })
  }
  const ciclo = cycleNumberFromPathId(hit.pathId)
  return t('progress.search.nextUseOther', { ciclo, n: hit.rebirth, tier })
}

export function tierThumbForDroid(droidId: string, progress: ProgressState) {
  return nextUseForDroid(droidId, progress)?.tier ?? ('default' as const)
}

export function uniqueTiersInHits(
  hits: ProgressDroidNeedHit[],
  tierLabels: Map<string, string>,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const h of hits) {
    const label = formatTierName(h.tier, tierLabels)
    if (seen.has(label)) continue
    seen.add(label)
    out.push(label)
  }
  return out
}

export function formatTierListPt(tiers: string[]): string {
  if (tiers.length === 0) return ''
  if (tiers.length === 1) return tiers[0]!
  if (tiers.length === 2) return `${tiers[0]} e ${tiers[1]}`
  return `${tiers.slice(0, -1).join(', ')} e ${tiers[tiers.length - 1]}`
}

export function pickDroidById(droids: Droid[], id: string | null): Droid | null {
  if (!id) return null
  return droids.find((d) => d.id === id) ?? null
}
