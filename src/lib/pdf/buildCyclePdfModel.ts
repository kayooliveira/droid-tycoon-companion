import { APP_BRAND_NAME } from '../brand'
import { formatCycleDisplayName } from '../cycleLabel'
import { droidImageSrc, isMissingImageFlag } from '../images'
import { cycleById, droidById, gameData, getRebirth } from '../../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../../domain/progress'
import { analyzeSellCenter } from '../../domain/sellCenter'
import {
  sellableUnitsByRebirth,
  unitsNewlySellableAfterRebirth,
  unitsSellableAfterRebirth,
  type RebirthSellDisposition,
} from '../../domain/rebirthSellPlan'
import { formatTierName } from '../../domain/tiers'
import { buildI18nTierLabelMapForLocale } from '../../i18n/tierLabels'
import { getPdfCopy } from '../pdfCopy'
import type { ExportCycleInput } from '../exportCycle'
import type { InventoryUnit } from '../../domain/types'

export interface PdfDroidReq {
  droidId: string
  name: string
  tier: string
  imageSrc: string
  imageMissing?: boolean
}

export interface PdfSellLine {
  label: string
  disposition: RebirthSellDisposition
}

export interface PdfRebirthRow {
  rebirth: number
  credits: string
  requirements: PdfDroidReq[]
  confidence: string
  unconfirmed: boolean
  sellLines: PdfSellLine[]
}

export interface PdfGuideSellBlock {
  rebirth: number
  sellLines: PdfSellLine[]
}

export interface CyclePdfModel {
  mode: 'guide' | 'progress'
  pathId: string
  locale: 'en' | 'pt-BR'
  brand: string
  labels: ReturnType<typeof getPdfCopy>
  cycleName: string
  cycleShort: string
  generatedLine: string
  dataVersionLine: string
  origin: string
  rebirths: PdfRebirthRow[]
  guideSellSummary?: PdfGuideSellBlock[]
  progress?: {
    completedOnPath: number
    nextRebirth: number
    pct: number
    invCount: number
    sellNowLabels: string[]
    keepUpgradeLabels: string[]
    upcoming: Array<{ rebirth: number; credits: string; droids: string[] }>
    remaining: Array<{ rebirth: number; credits: string; droids: string[] }>
  }
}

function resolveOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://127.0.0.1:4173'
}

function resolveAsset(path: string, origin: string): string {
  if (path.startsWith('http')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${origin}${p}`
}

function formatPdfDate(locale: 'en' | 'pt-BR'): string {
  return new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function inventoryUnitCount(inventory: InventoryUnit[]): number {
  return inventory.reduce((sum, u) => sum + (u.quantity ?? 1), 0)
}

export function distinctDroidsOnPath(pathId: string): number {
  const ids = new Set<string>()
  for (let n = 1; n <= REBIRTHS_PER_PATH; n++) {
    getRebirth(pathId, n)?.requirements.forEach((r) => ids.add(r.droidId))
  }
  return ids.size
}

function mapRebirthRow(
  pathId: string,
  n: number,
  tierLabels: Map<string, string>,
  origin: string,
): PdfRebirthRow | null {
  const entry = getRebirth(pathId, n)
  if (!entry) return null
  return {
    rebirth: n,
    credits: entry.credits,
    confidence: entry.confidence,
    unconfirmed: entry.confidence === 'partial',
    sellLines: [],
    requirements: entry.requirements.map((req) => {
      const droid = droidById.get(req.droidId)
      const missing = droid ? isMissingImageFlag(droid) || !droid.imageLocal : true
      return {
        droidId: req.droidId,
        name: droid?.name ?? req.droidId,
        tier: formatTierName(req.rarity, tierLabels),
        imageMissing: missing,
        imageSrc: missing
          ? ''
          : resolveAsset(droidImageSrc(req.droidId, droid?.imageLocal), origin),
      }
    }),
  }
}

function droidLineLabel(
  droidId: string,
  tier: string,
  tierLabels: Map<string, string>,
  quantity = 1,
): string {
  const droid = droidById.get(droidId)
  const name = droid?.name ?? droidId
  const t = formatTierName(tier as Parameters<typeof formatTierName>[0], tierLabels)
  const qty = quantity > 1 ? ` ×${quantity}` : ''
  return `${name} · ${t}${qty}`
}

function mapSellUnitsToLines(
  units: ReturnType<typeof unitsNewlySellableAfterRebirth>,
  tierLabels: Map<string, string>,
): PdfSellLine[] {
  return units
    .filter(
      (u) =>
        u.disposition === 'sellable' ||
        u.disposition === 'fusionHold' ||
        u.disposition === 'fusionCaution',
    )
    .map((u) => ({
      label: droidLineLabel(u.droidId, u.tier, tierLabels, u.quantity),
      disposition: u.disposition,
    }))
}

export function buildCyclePdfModel(input: ExportCycleInput): CyclePdfModel | null {
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return null

  const origin = resolveOrigin()
  const locale = input.locale
  const labels = getPdfCopy(locale)
  const tierLabels = buildI18nTierLabelMapForLocale(locale)
  const cycleName = formatCycleDisplayName(cycle.name, locale)
  const cycleShort =
    cycleName.length > 28 ? `${cycleName.slice(0, 27)}…` : cycleName

  const rebirths: PdfRebirthRow[] = []
  for (let n = 1; n <= REBIRTHS_PER_PATH; n++) {
    const row = mapRebirthRow(input.pathId, n, tierLabels, origin)
    if (row) rebirths.push(row)
  }

  const model: CyclePdfModel = {
    mode: input.mode ?? 'progress',
    pathId: input.pathId,
    locale,
    brand: APP_BRAND_NAME,
    labels,
    cycleName,
    cycleShort,
    generatedLine: labels.generated.replace('{{date}}', formatPdfDate(locale)),
    dataVersionLine: labels.dataVersion
      .replace('{{version}}', gameData.dataVersion)
      .replace('{{game}}', gameData.gameVersion),
    origin,
    rebirths,
  }

  if ((input.mode ?? 'progress') === 'guide') {
    const sellMap = sellableUnitsByRebirth(input.pathId)
    model.rebirths = rebirths.map((row) => {
      const units = sellMap.get(row.rebirth) ?? []
      const sellLines = mapSellUnitsToLines(units, tierLabels)
      return { ...row, sellLines }
    })
    model.guideSellSummary = model.rebirths
      .filter((row) => row.sellLines.length > 0)
      .map((row) => ({ rebirth: row.rebirth, sellLines: row.sellLines }))
  }

  if ((input.mode ?? 'progress') === 'progress') {
    const pct = pathProgressPercent({
      pathId: input.pathId,
      nextRebirth: input.nextRebirth,
      completedOnPath: input.completedOnPath,
    })
    const sellNowUnits = unitsSellableAfterRebirth(input.pathId, input.completedOnPath).filter(
      (u) => u.disposition === 'sellable',
    )
    const sellAnalysis = analyzeSellCenter(
      input.pathId,
      input.nextRebirth,
      input.inventory ?? [],
    )
    const keepUpgradeLabels = sellAnalysis
      .filter((i) => i.category === 'upgrade' && i.upgradeTargetTier && i.nextNeededAtRebirth)
      .slice(0, 8)
      .map((i) =>
        labels.keepForUpgrade
          .replace('{{tier}}', formatTierName(i.upgradeTargetTier!, tierLabels))
          .replace('{{rebirth}}', String(i.nextNeededAtRebirth)),
      )
    const upcomingEnd = Math.min(input.nextRebirth + 3, REBIRTHS_PER_PATH)
    const tableStart = Math.min(upcomingEnd + 1, REBIRTHS_PER_PATH + 1)

    const upcoming = []
    for (let r = input.nextRebirth; r <= upcomingEnd; r++) {
      const entry = getRebirth(input.pathId, r)
      if (!entry) continue
      upcoming.push({
        rebirth: r,
        credits: entry.credits,
        droids: entry.requirements.map((req) =>
          droidLineLabel(req.droidId, req.rarity, tierLabels),
        ),
      })
    }

    const remaining = []
    for (let r = tableStart; r <= REBIRTHS_PER_PATH; r++) {
      const entry = getRebirth(input.pathId, r)
      if (!entry) continue
      remaining.push({
        rebirth: r,
        credits: entry.credits,
        droids: entry.requirements.map((req) =>
          droidLineLabel(req.droidId, req.rarity, tierLabels),
        ),
      })
    }

    model.progress = {
      completedOnPath: input.completedOnPath,
      nextRebirth: input.nextRebirth,
      pct,
      invCount: inventoryUnitCount(input.inventory),
      sellNowLabels: sellNowUnits.slice(0, 14).map((u) =>
        droidLineLabel(u.droidId, u.tier, tierLabels, u.quantity),
      ),
      keepUpgradeLabels,
      upcoming,
      remaining,
    }
  }

  return model
}

export function guideFactsLine(model: CyclePdfModel): string {
  const L = model.labels
  return `${L.coverFactRebirths}: ${REBIRTHS_PER_PATH} · ${L.coverFactSuper}: #${SUPER_REBIRTH_UNLOCK_AFTER} · ${L.coverFactDroids}: ${distinctDroidsOnPath(model.pathId)}`
}

export function progressRebirthCards(
  input: ExportCycleInput,
  tierLabels: Map<string, string>,
): Array<{
  rebirth: number
  credits: string
  status: 'done' | 'next' | 'pending'
  requirements: PdfDroidReq[]
  sellLabels: string[]
  sellLines: PdfSellLine[]
}> {
  const origin = resolveOrigin()
  const list: Array<{
    rebirth: number
    credits: string
    status: 'done' | 'next' | 'pending'
    requirements: PdfDroidReq[]
    sellLabels: string[]
    sellLines: PdfSellLine[]
  }> = []
  for (let n = 1; n <= REBIRTHS_PER_PATH; n++) {
    const entry = getRebirth(input.pathId, n)
    if (!entry) continue
    const status: 'done' | 'next' | 'pending' =
      n < input.nextRebirth ? 'done' : n === input.nextRebirth ? 'next' : 'pending'
    const sellUnits = unitsNewlySellableAfterRebirth(input.pathId, n)
    const sellLines = mapSellUnitsToLines(sellUnits, tierLabels)
    list.push({
      rebirth: n,
      credits: entry.credits,
      status,
      requirements: entry.requirements.map((req) => {
        const droid = droidById.get(req.droidId)
        const missing = droid ? isMissingImageFlag(droid) || !droid.imageLocal : true
        return {
          droidId: req.droidId,
          name: droid?.name ?? req.droidId,
          tier: formatTierName(req.rarity, tierLabels),
          imageMissing: missing,
          imageSrc: missing
            ? ''
            : resolveAsset(droidImageSrc(req.droidId, droid?.imageLocal), origin),
        }
      }),
      sellLabels: sellLines.slice(0, 6).map((line) => line.label),
      sellLines,
    })
  }
  return list
}
