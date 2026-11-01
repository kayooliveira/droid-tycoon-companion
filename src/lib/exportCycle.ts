import { APP_BRAND_NAME } from './brand'
import { APP_PUBLIC_URL } from './constants'
import { formatCycleDisplayName } from './cycleLabel'
import { droidImageSrc } from './images'
import { cycleById, droidById, getRebirth } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import {
  unitsNewlySellableAfterRebirth,
  unitsSellableAfterRebirth,
  type RebirthUnitUsage,
} from '../domain/rebirthSellPlan'
import { formatTierName } from '../domain/tiers'
import { buildI18nTierLabelMapForLocale } from '../i18n/tierLabels'
import { getPdfCopy } from './pdfCopy'
import { pdfTheme as T } from './pdfTheme'
import { gameData } from '../domain/gameData'
import type { InventoryUnit, RebirthEntry } from '../domain/types'

export type ExportCycleMode = 'guide' | 'progress'

export interface ExportCycleInput {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory: InventoryUnit[]
  locale: 'en' | 'pt-BR'
  mode?: ExportCycleMode
}

const PAGE_W = 794
const PAGE_H = 1123
const PAD = 36
const FOOTER_H = 72
const COL_GAP = 12
const ROW_GAP = 10
const COLS = 2
const ROWS_PER_PAGE = 5
const REBIRTHS_PER_PAGE = COLS * ROWS_PER_PAGE
const CARD_W = (PAGE_W - PAD * 2 - COL_GAP) / 2
const DROID_ROW_H = 32
const CARD_H = 52 + DROID_ROW_H * 3 + 44
const GUIDE_ROW_H = 62
const GUIDE_NUM_W = 36
const GUIDE_CRED_W = 92

let exportTierLabels = buildI18nTierLabelMapForLocale('en')

function applyExportLocale(locale: 'en' | 'pt-BR') {
  exportTierLabels = buildI18nTierLabelMapForLocale(locale)
}

function cycleShortLabel(pathId: string, locale: 'en' | 'pt-BR'): string {
  const name = formatCycleDisplayName(cycleById.get(pathId)?.name ?? pathId, locale)
  return name.length > 28 ? `${name.slice(0, 27)}…` : name
}

function formatPdfDate(locale: 'en' | 'pt-BR'): string {
  return new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function labels(input: ExportCycleInput) {
  const p = getPdfCopy(input.locale)
  const pathName = formatCycleDisplayName(
    cycleById.get(input.pathId)?.name ?? input.pathId,
    input.locale,
  )
  const isGuide = (input.mode ?? 'progress') === 'guide'
  const coverLine = isGuide
    ? p.guideCoverHeading.replace('{{cycle}}', pathName)
    : p.progressCoverHeading.replace('{{cycle}}', pathName)
  return {
    ...p,
    brand: APP_BRAND_NAME,
    myCycle: (_name: string) => coverLine,
    date: p.generated.replace('{{date}}', formatPdfDate(input.locale)),
  }
}

function distinctDroidsOnPath(pathId: string): number {
  const ids = new Set<string>()
  for (let n = 1; n <= REBIRTHS_PER_PATH; n++) {
    getRebirth(pathId, n)?.requirements.forEach((r) => ids.add(r.droidId))
  }
  return ids.size
}

function countRebirthSheetPages(rebirthCount: number): number {
  let pages = 1
  let onPage = 0
  for (let i = 0; i < rebirthCount; i++) {
    onPage++
    if (onPage >= REBIRTHS_PER_PAGE) {
      pages++
      onPage = 0
    }
  }
  return Math.max(1, pages)
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function createPageCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_W
  canvas.height = PAGE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  return { canvas, ctx }
}

function fillBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = T.bg
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)
}

function inventoryUnitCount(inventory: InventoryUnit[]): number {
  return inventory.reduce((sum, u) => sum + (u.quantity ?? 1), 0)
}

function drawPageFooter(
  ctx: CanvasRenderingContext2D,
  input: ExportCycleInput,
  page: number,
  total: number,
) {
  const L = getPdfCopy(input.locale)
  const text = L.pageFooter
    .replace('{{brand}}', APP_BRAND_NAME)
    .replace('{{cycle}}', cycleShortLabel(input.pathId, input.locale))
    .replace('{{page}}', String(page))
    .replace('{{total}}', String(total))
  ctx.fillStyle = T.footer
  ctx.font = '11px system-ui, sans-serif'
  const tw = ctx.measureText(text).width
  ctx.fillText(text, (PAGE_W - tw) / 2, PAGE_H - 28)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawStatBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
) {
  ctx.fillStyle = T.cardBg
  ctx.strokeStyle = T.cardBorder
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 10)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = T.textSoft
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(label, x + 12, y + 24)
  ctx.fillStyle = T.text
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(value, x + 12, y + 52)
}

function unitChipLabelFull(droidId: string, tier: string): string {
  const droid = droidById.get(droidId)
  const name = droid?.name ?? droidId
  return `${name} · ${tier}`
}

function splitTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

function drawTierPill(ctx: CanvasRenderingContext2D, x: number, y: number, tier: string): number {
  ctx.font = '8px system-ui, sans-serif'
  const tw = ctx.measureText(tier).width
  const pw = tw + 8
  const ph = 14
  ctx.fillStyle = T.accentSoft
  roundRect(ctx, x, y, pw, ph, 4)
  ctx.fill()
  ctx.fillStyle = T.textMuted
  ctx.fillText(tier, x + 4, y + 10)
  return ph
}

function drawFullUnitChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxW: number,
  label: string,
): number {
  ctx.font = '9px system-ui, sans-serif'
  const lines = splitTextLines(ctx, label, maxW)
  const lineH = 11
  const ph = lines.length * lineH + 8
  ctx.fillStyle = T.accentSoft
  roundRect(ctx, x, y, maxW, ph, 5)
  ctx.fill()
  ctx.fillStyle = T.text
  lines.forEach((ln, i) => ctx.fillText(ln, x + 5, y + 10 + i * lineH))
  return ph
}

async function drawDroidRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxW: number,
  droidId: string,
  tierId: string,
) {
  const droid = droidById.get(droidId)
  const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
  if (img) ctx.drawImage(img, x, y, 28, 28)
  const name = droid?.name ?? droidId
  const tier = formatTierName(tierId as RebirthUnitUsage['tier'], exportTierLabels)
  ctx.fillStyle = T.text
  ctx.font = '10px system-ui, sans-serif'
  const nameMax = maxW - 38
  const nameLines = splitTextLines(ctx, name, nameMax).slice(0, 2)
  nameLines.forEach((ln, i) => ctx.fillText(ln, x + 34, y + 12 + i * 12))
  drawTierPill(ctx, x + 34, y + 12 + nameLines.length * 12, tier)
}

async function drawSellUnitChips(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxW: number,
  units: RebirthUnitUsage[],
  emptyLabel: string,
): Promise<number> {
  if (units.length === 0) {
    ctx.fillStyle = T.textSoft
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText(emptyLabel, x, y + 10)
    return 14
  }
  let cy = y
  for (const unit of units.slice(0, 12)) {
    const tier = formatTierName(unit.tier, exportTierLabels)
    const chip = unitChipLabelFull(unit.droidId, tier)
    const h = drawFullUnitChip(ctx, x, cy, maxW, chip)
    cy += h + 4
  }
  return cy - y
}

async function drawCompactDroidLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxW: number,
  droidId: string,
  tierId: string,
): Promise<number> {
  const droid = droidById.get(droidId)
  const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
  if (img) ctx.drawImage(img, x, y, 18, 18)
  const tier = formatTierName(tierId as RebirthUnitUsage['tier'], exportTierLabels)
  const name = droid?.name ?? droidId
  ctx.fillStyle = T.text
  ctx.font = '9px system-ui, sans-serif'
  const lines = splitTextLines(ctx, `${name} · ${tier}`, maxW - 22).slice(0, 2)
  lines.forEach((ln, i) => ctx.fillText(ln, x + 22, y + 10 + i * 10))
  return Math.max(18, 10 + lines.length * 10) + 4
}

function estimateChipBlockHeight(
  ctx: CanvasRenderingContext2D,
  units: RebirthUnitUsage[],
  maxW: number,
): number {
  if (units.length === 0) return 14
  ctx.font = '9px system-ui, sans-serif'
  let h = 0
  for (const unit of units.slice(0, 12)) {
    const tier = formatTierName(unit.tier, exportTierLabels)
    const label = unitChipLabelFull(unit.droidId, tier)
    const lines = splitTextLines(ctx, label, maxW).length
    h += lines * 11 + 8 + 4
  }
  return h
}

async function measureUpcomingHeight(
  pathId: string,
  fromRebirth: number,
  toRebirth: number,
): Promise<number> {
  let h = 22
  for (let r = fromRebirth; r <= toRebirth; r++) {
    const entry = getRebirth(pathId, r)
    if (!entry) continue
    h += 14 + entry.requirements.length * 18 + 6
  }
  return h + 8
}

async function drawUpcomingRebirths(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  input: ExportCycleInput,
  L: ReturnType<typeof labels>,
) {
  let uy = y
  const start = input.nextRebirth
  const end = Math.min(start + 3, REBIRTHS_PER_PATH)
  for (let r = start; r <= end; r++) {
    const entry = getRebirth(input.pathId, r)
    if (!entry) continue
    ctx.fillStyle = T.textMuted
    ctx.font = 'bold 10px system-ui, sans-serif'
    ctx.fillText(`${L.rebirth} ${r} · ${entry.credits}`, x, uy + 10)
    uy += 14
    for (const req of entry.requirements) {
      const used = await drawCompactDroidLine(ctx, x, uy, w, req.droidId, req.rarity)
      uy += used
    }
    uy += 6
  }
}

async function drawRemainingTable(
  ctx: CanvasRenderingContext2D,
  y: number,
  input: ExportCycleInput,
  L: ReturnType<typeof labels>,
  tableStartRebirth: number,
  maxY: number,
): Promise<number> {
  ctx.fillStyle = T.text
  ctx.font = 'bold 13px system-ui, sans-serif'
  ctx.fillText(L.remainingRebirths, PAD + 12, y + 16)
  let ry = y + 28

  const droidColX = PAD + 108
  const droidColW = PAGE_W - PAD - droidColX - 12

  for (let r = tableStartRebirth; r <= REBIRTHS_PER_PATH; r++) {
    const entry = getRebirth(input.pathId, r)
    if (!entry) continue
    const rowH = Math.max(28, 10 + entry.requirements.length * 18)
    if (ry + rowH > maxY) break

    ctx.fillStyle = T.bgAlt
    roundRect(ctx, PAD, ry - 2, PAGE_W - PAD * 2, rowH - 2, 6)
    ctx.fill()

    ctx.fillStyle = T.text
    ctx.font = 'bold 10px system-ui, sans-serif'
    ctx.fillText(`#${r}`, PAD + 12, ry + 14)
    ctx.fillStyle = T.textMuted
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText(entry.credits, PAD + 44, ry + 14)

    let dy = ry + 4
    for (const req of entry.requirements) {
      const used = await drawCompactDroidLine(ctx, droidColX, dy, droidColW, req.droidId, req.rarity)
      dy += used
    }
    ry += rowH
  }
  return ry
}

async function drawCover(ctx: CanvasRenderingContext2D, input: ExportCycleInput) {
  fillBackground(ctx)
  const L = labels(input)
  const pathName = formatCycleDisplayName(
    cycleById.get(input.pathId)?.name ?? input.pathId,
    input.locale,
  )
  const pct = pathProgressPercent({
    pathId: input.pathId,
    nextRebirth: input.nextRebirth,
    completedOnPath: input.completedOnPath,
  })
  const invCount = inventoryUnitCount(input.inventory)

  const logo = await loadImage('/pwa-512.png')
  const headerY = PAD
  if (logo) ctx.drawImage(logo, PAD, headerY, 96, 96)

  ctx.fillStyle = T.text
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillText(L.brand, PAD + 112, headerY + 38)
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillStyle = T.accent
  ctx.fillText(L.myCycle(pathName), PAD + 112, headerY + 76)

  const gridY = headerY + 108
  const blockW = (PAGE_W - PAD * 2 - COL_GAP) / 2
  const blockH = 68
  drawStatBlock(
    ctx,
    PAD,
    gridY,
    blockW,
    blockH,
    L.rebirthsDone,
    `${input.completedOnPath}/${REBIRTHS_PER_PATH}`,
  )
  drawStatBlock(ctx, PAD + blockW + COL_GAP, gridY, blockW, blockH, L.pathPct, `${pct.toFixed(0)}%`)
  drawStatBlock(
    ctx,
    PAD,
    gridY + blockH + COL_GAP,
    blockW,
    blockH,
    L.nextRebirth,
    `#${Math.min(input.nextRebirth, REBIRTHS_PER_PATH)}`,
  )
  drawStatBlock(
    ctx,
    PAD + blockW + COL_GAP,
    gridY + blockH + COL_GAP,
    blockW,
    blockH,
    L.inventory,
    String(invCount),
  )

  const panelY = gridY + (blockH + COL_GAP) * 2 + 12
  const panelW = (PAGE_W - PAD * 2 - COL_GAP) / 2
  const upcomingEnd = Math.min(input.nextRebirth + 3, REBIRTHS_PER_PATH)
  const tableStart = Math.min(upcomingEnd + 1, REBIRTHS_PER_PATH + 1)

  const sellNowUnits = unitsSellableAfterRebirth(input.pathId, input.completedOnPath).filter(
    (u) => u.disposition === 'sellable',
  )
  const sellInnerH = estimateChipBlockHeight(ctx, sellNowUnits, panelW - 24)
  const upcomingInnerH = await measureUpcomingHeight(
    input.pathId,
    input.nextRebirth,
    upcomingEnd,
  )
  const sellPanelH = 22 + sellInnerH + 12
  const upcomingPanelH = 22 + upcomingInnerH + 12

  ctx.fillStyle = T.cardBg
  ctx.strokeStyle = T.cardBorder
  ctx.lineWidth = 1
  roundRect(ctx, PAD, panelY, panelW, sellPanelH, 10)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = T.text
  ctx.font = 'bold 13px system-ui, sans-serif'
  ctx.fillText(L.sellNow, PAD + 12, panelY + 20)
  await drawSellUnitChips(
    ctx,
    PAD + 12,
    panelY + 26,
    panelW - 24,
    sellNowUnits,
    L.noneSellNow,
  )

  const rightX = PAD + panelW + COL_GAP
  ctx.fillStyle = T.cardBg
  ctx.strokeStyle = T.cardBorder
  roundRect(ctx, rightX, panelY, panelW, upcomingPanelH, 10)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = T.text
  ctx.font = 'bold 13px system-ui, sans-serif'
  ctx.fillText(L.upcomingRebirths, rightX + 12, panelY + 20)
  await drawUpcomingRebirths(ctx, rightX + 12, panelY + 26, panelW - 24, input, L)

  const tableY = panelY + Math.max(sellPanelH, upcomingPanelH) + 14
  const maxTableY = PAGE_H - FOOTER_H - 30
  if (tableStart <= REBIRTHS_PER_PATH && tableY + 40 < maxTableY) {
    await drawRemainingTable(ctx, tableY, input, L, tableStart, maxTableY)
  }

  const dateStr = new Date().toLocaleDateString(input.locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  ctx.fillStyle = T.textSoft
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(`${L.date}: ${dateStr}`, PAD, PAGE_H - FOOTER_H - 14)

}

function rebirthStatus(
  rebirth: number,
  input: ExportCycleInput,
): 'done' | 'next' | 'pending' {
  if (rebirth < input.nextRebirth) return 'done'
  if (rebirth === input.nextRebirth) return 'next'
  return 'pending'
}

function drawStatusChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  status: 'done' | 'next' | 'pending',
) {
  const colors = {
    done: { bg: '#dcfce7', fg: '#166534' },
    next: { bg: T.accentSoft, fg: '#1e40af' },
    pending: { bg: T.bgAlt, fg: T.textSoft },
  }[status]
  ctx.font = '9px system-ui, sans-serif'
  const tw = ctx.measureText(label).width
  const pw = tw + 12
  ctx.fillStyle = colors.bg
  roundRect(ctx, x, y - 10, pw, 16, 5)
  ctx.fill()
  ctx.fillStyle = colors.fg
  ctx.fillText(label, x + 6, y + 2)
}

async function drawCompactRebirthCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  entry: RebirthEntry,
  input: ExportCycleInput,
) {
  const L = labels(input)
  const isGuide = (input.mode ?? 'progress') === 'guide'
  const status = rebirthStatus(entry.rebirth, input)
  const statusLabel =
    status === 'done' ? L.done : status === 'next' ? L.next : L.pending

  ctx.fillStyle = T.cardBg
  ctx.strokeStyle = T.cardBorder
  ctx.lineWidth = 1
  roundRect(ctx, x, y, CARD_W, CARD_H, 10)
  ctx.fill()
  ctx.stroke()

  const innerX = x + 8
  const innerW = CARD_W - 16
  let cy = y + 18
  ctx.fillStyle = T.text
  ctx.font = 'bold 13px system-ui, sans-serif'
  const title = `${L.rebirth} ${entry.rebirth}`
  ctx.fillText(title, innerX, cy)
  if (isGuide) {
    if (entry.confidence !== 'confirmed') {
      drawStatusChip(ctx, innerX + ctx.measureText(title).width + 6, cy, L.unconfirmed, 'pending')
    }
  } else {
    drawStatusChip(ctx, innerX + ctx.measureText(title).width + 6, cy, statusLabel, status)
  }

  cy += 16
  ctx.fillStyle = T.textMuted
  ctx.font = '10px system-ui, sans-serif'
  ctx.fillText(`${L.credits}: ${entry.credits}`, innerX, cy)

  cy += 8
  for (const req of entry.requirements.slice(0, 3)) {
    cy += DROID_ROW_H
    await drawDroidRow(ctx, innerX, cy - DROID_ROW_H + 2, innerW, req.droidId, req.rarity)
  }

  if (!isGuide) {
    cy += 6
    ctx.fillStyle = T.accent
    ctx.font = 'bold 9px system-ui, sans-serif'
    ctx.fillText(L.sellAfter, innerX, cy + 10)

    const sellUnits = unitsNewlySellableAfterRebirth(input.pathId, entry.rebirth).filter(
      (u) => u.disposition === 'sellable',
    )
    await drawSellUnitChips(ctx, innerX, cy + 14, innerW, sellUnits, L.noneSell)
  }
}


async function renderRebirthPages(input: ExportCycleInput): Promise<HTMLCanvasElement[]> {
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return []

  const pages: HTMLCanvasElement[] = []
  let { canvas, ctx } = createPageCanvas()
  fillBackground(ctx)
  let indexOnPage = 0
  let row = 0
  let col = 0
  const contentTop = PAD
  const contentBottom = PAGE_H - FOOTER_H - PAD

  const placeCard = async (entry: RebirthEntry) => {
    if (indexOnPage >= REBIRTHS_PER_PAGE) {
      pages.push(canvas)
      ;({ canvas, ctx } = createPageCanvas())
      fillBackground(ctx)
      indexOnPage = 0
      row = 0
      col = 0
    }
    const x = PAD + col * (CARD_W + COL_GAP)
    const y = contentTop + row * (CARD_H + ROW_GAP)
    if (y + CARD_H > contentBottom) {
      pages.push(canvas)
      ;({ canvas, ctx } = createPageCanvas())
      fillBackground(ctx)
      indexOnPage = 0
      row = 0
      col = 0
      return placeCard(entry)
    }
    await drawCompactRebirthCard(ctx, x, y, entry, input)
    col++
    if (col >= COLS) {
      col = 0
      row++
    }
    indexOnPage++
  }

  for (const entry of cycle.rebirths) {
    await placeCard(entry)
  }

  pages.push(canvas)
  return pages
}

function drawGuideTableHeaders(ctx: CanvasRenderingContext2D, input: ExportCycleInput, y: number): number {
  const L = labels(input)
  ctx.fillStyle = T.textMuted
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.fillText('#', PAD + 4, y)
  ctx.fillText(L.credits, PAD + GUIDE_NUM_W, y)
  ctx.fillText(L.requirements, PAD + GUIDE_NUM_W + GUIDE_CRED_W + 8, y)
  return y + 14
}

async function drawGuideDroidCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  droidId: string,
  tierId: string,
) {
  const droid = droidById.get(droidId)
  const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
  const cx = x + (w - 22) / 2
  if (img) ctx.drawImage(img, cx, y, 22, 22)
  const name = droid?.name ?? droidId
  const tier = formatTierName(tierId as RebirthUnitUsage['tier'], exportTierLabels)
  ctx.fillStyle = T.text
  ctx.font = '10px system-ui, sans-serif'
  const nameLines = splitTextLines(ctx, name, w).slice(0, 2)
  nameLines.forEach((ln, i) => {
    const tw = ctx.measureText(ln).width
    ctx.fillText(ln, x + (w - tw) / 2, y + 28 + i * 11)
  })
  const tierY = y + 28 + nameLines.length * 11 + 2
  const tw = ctx.measureText(tier).width
  drawTierPill(ctx, x + (w - tw - 8) / 2, tierY, tier)
}

async function drawGuideRebirthRow(
  ctx: CanvasRenderingContext2D,
  input: ExportCycleInput,
  y: number,
  rebirth: number,
  zebra: boolean,
) {
  const L = labels(input)
  const entry = getRebirth(input.pathId, rebirth)
  if (!entry) return
  const rowW = PAGE_W - PAD * 2
  const isSuper = rebirth === SUPER_REBIRTH_UNLOCK_AFTER
  ctx.fillStyle = isSuper ? T.accentSoft : zebra ? T.bgAlt : T.cardBg
  roundRect(ctx, PAD, y, rowW, GUIDE_ROW_H - 4, 6)
  ctx.fill()
  if (isSuper) {
    ctx.strokeStyle = T.accent
    ctx.lineWidth = 1
    roundRect(ctx, PAD, y, rowW, GUIDE_ROW_H - 4, 6)
    ctx.stroke()
  }

  ctx.fillStyle = T.text
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.fillText(String(rebirth), PAD + 8, y + 38)
  if (isSuper) {
    ctx.fillStyle = T.accent
    ctx.font = 'bold 8px system-ui, sans-serif'
    ctx.fillText(L.guideSuperRow, PAD + 4, y + 52)
  }
  ctx.fillStyle = T.textMuted
  ctx.font = '10px system-ui, sans-serif'
  const credLines = splitTextLines(ctx, entry.credits, GUIDE_CRED_W - 8)
  credLines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, PAD + GUIDE_NUM_W, y + 34 + i * 11))

  const droidsX = PAD + GUIDE_NUM_W + GUIDE_CRED_W + 8
  const droidsW = PAGE_W - PAD - droidsX
  const cellW = droidsW / 3
  for (let i = 0; i < entry.requirements.length; i++) {
    const req = entry.requirements[i]!
    await drawGuideDroidCell(ctx, droidsX + i * cellW, y + 6, cellW - 4, req.droidId, req.rarity)
  }
}

async function drawGuideCompactHeader(
  ctx: CanvasRenderingContext2D,
  input: ExportCycleInput,
  startY: number,
): Promise<number> {
  const L = labels(input)
  const pathName = formatCycleDisplayName(
    cycleById.get(input.pathId)?.name ?? input.pathId,
    input.locale,
  )
  let y = startY
  const logo = await loadImage('/pwa-512.png')
  if (logo) ctx.drawImage(logo, PAD, y, 48, 48)
  ctx.fillStyle = T.text
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(L.brand, PAD + 56, y + 22)
  ctx.fillStyle = T.accent
  ctx.font = 'bold 17px system-ui, sans-serif'
  ctx.fillText(L.guideCoverHeading.replace('{{cycle}}', pathName), PAD + 56, y + 42)
  y += 54

  ctx.fillStyle = T.textMuted
  ctx.font = '10px system-ui, sans-serif'
  const facts = `${L.coverFactRebirths}: ${REBIRTHS_PER_PATH} · ${L.coverFactSuper}: #${SUPER_REBIRTH_UNLOCK_AFTER} · ${L.coverFactDroids}: ${distinctDroidsOnPath(input.pathId)}`
  ctx.fillText(facts, PAD, y)
  y += 14
  ctx.fillText(
    L.dataVersion
      .replace('{{version}}', gameData.dataVersion)
      .replace('{{game}}', gameData.gameVersion),
    PAD,
    y,
  )
  y += 14
  wrapText(ctx, L.guideIntro, PAD, y, PAGE_W - PAD * 2, 11)
  y += 22

  ctx.fillStyle = T.text
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.fillText(L.guideHowToTitle, PAD, y)
  y += 12
  ctx.fillStyle = T.textMuted
  ctx.font = '9px system-ui, sans-serif'
  for (const key of ['guideHowTo1', 'guideHowTo2', 'guideHowTo3'] as const) {
    wrapText(ctx, `• ${L[key]}`, PAD + 4, y, PAGE_W - PAD * 2 - 4, 11)
    y += 20
  }
  ctx.fillStyle = T.textSoft
  ctx.font = '9px system-ui, sans-serif'
  ctx.fillText(L.date, PAD, y)
  return y + 12
}

function drawGuideClosingNotes(
  ctx: CanvasRenderingContext2D,
  input: ExportCycleInput,
  startY: number,
): number {
  const L = labels(input)
  let y = startY
  ctx.strokeStyle = T.border
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(PAGE_W - PAD, y)
  ctx.stroke()
  y += 16
  ctx.fillStyle = T.text
  ctx.font = 'bold 12px system-ui, sans-serif'
  ctx.fillText(L.closingTitle, PAD, y)
  y += 18
  ctx.fillStyle = T.textMuted
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.fillText(L.superTitle, PAD, y)
  y += 14
  ctx.font = '10px system-ui, sans-serif'
  wrapText(
    ctx,
    L.superBody.replace('{{n}}', String(SUPER_REBIRTH_UNLOCK_AFTER)),
    PAD,
    y,
    PAGE_W - PAD * 2,
    13,
  )
  y += 36
  ctx.fillStyle = T.textSoft
  ctx.font = '9px system-ui, sans-serif'
  wrapText(ctx, L.disclaimer, PAD, y, PAGE_W - PAD * 2, 12)
  y += 28
  wrapText(ctx, L.sources, PAD, y, PAGE_W - PAD * 2, 12)
  return y + 20
}

async function renderGuidePages(input: ExportCycleInput): Promise<HTMLCanvasElement[]> {
  const pages: HTMLCanvasElement[] = []
  let rebirth = 1
  let pageIndex = 0
  const bottom = PAGE_H - FOOTER_H - PAD

  while (rebirth <= REBIRTHS_PER_PATH) {
    const { canvas, ctx } = createPageCanvas()
    fillBackground(ctx)
    let y = PAD
    if (pageIndex === 0) {
      y = await drawGuideCompactHeader(ctx, input, y)
    } else {
      const L = labels(input)
      ctx.fillStyle = T.textMuted
      ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.fillText(L.guideContinued, PAD, y + 12)
      y += 24
    }
    y = drawGuideTableHeaders(ctx, input, y)

    while (rebirth <= REBIRTHS_PER_PATH && y + GUIDE_ROW_H <= bottom) {
      await drawGuideRebirthRow(ctx, input, y, rebirth, rebirth % 2 === 0)
      y += GUIDE_ROW_H
      rebirth++
    }

    pages.push(canvas)
    if (rebirth > REBIRTHS_PER_PATH) {
      const notesBlockH = 148
      const notesY = Math.max(y + 10, PAGE_H - FOOTER_H - notesBlockH - PAD)
      drawGuideClosingNotes(ctx, input, notesY)
      return pages
    }
    pageIndex++
  }

  return pages
}

function drawClosingPage(ctx: CanvasRenderingContext2D, input: ExportCycleInput) {
  const L = labels(input)
  let y = PAD
  ctx.fillStyle = T.text
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(L.closingTitle, PAD, y)
  y += 32
  ctx.fillStyle = T.textMuted
  ctx.font = 'bold 15px system-ui, sans-serif'
  ctx.fillText(L.superTitle, PAD, y)
  y += 22
  ctx.font = '14px system-ui, sans-serif'
  wrapText(
    ctx,
    L.superBody.replace('{{n}}', String(SUPER_REBIRTH_UNLOCK_AFTER)),
    PAD,
    y,
    PAGE_W - PAD * 2,
    20,
  )
  y += 64
  ctx.fillStyle = T.textSoft
  ctx.font = '12px system-ui, sans-serif'
  wrapText(ctx, L.disclaimer, PAD, y, PAGE_W - PAD * 2, 17)
  y += 52
  wrapText(ctx, L.sources, PAD, y, PAGE_W - PAD * 2, 17)
  y += 44
  ctx.fillStyle = T.footer
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(APP_PUBLIC_URL.replace('https://', ''), PAD, y)
}

export async function buildCyclePdfCanvases(input: ExportCycleInput): Promise<HTMLCanvasElement[]> {
  applyExportLocale(input.locale)
  const mode = input.mode ?? 'progress'
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return []

  const out: HTMLCanvasElement[] = []

  if (mode === 'guide') {
    const guidePages = await renderGuidePages(input)
    const totalPages = guidePages.length
    guidePages.forEach((canvas, i) => {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawPageFooter(ctx, input, i + 1, totalPages)
        out.push(canvas)
      }
    })
    return out
  }

  const rebirthSheets = countRebirthSheetPages(cycle.rebirths.length)
  const totalPages = 1 + rebirthSheets + 1
  let pageNum = 0

  const stamp = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    pageNum++
    drawPageFooter(ctx, input, pageNum, totalPages)
    out.push(canvas)
  }

  {
    const cover = createPageCanvas()
    fillBackground(cover.ctx)
    await drawCover(cover.ctx, input)
    stamp(cover.canvas, cover.ctx)

    const rebirthPages = await renderRebirthPages(input)
    for (const canvas of rebirthPages) {
      const ctx = canvas.getContext('2d')
      if (ctx) stamp(canvas, ctx)
    }
  }

  const closing = createPageCanvas()
  fillBackground(closing.ctx)
  drawClosingPage(closing.ctx, input)
  stamp(closing.canvas, closing.ctx)

  return out
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      y += lineHeight
      line = word
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
}

async function canvasesToPdf(pages: HTMLCanvasElement[]): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [PAGE_W, PAGE_H],
    compress: true,
  })
  pages.forEach((canvas, i) => {
    if (i > 0) doc.addPage([PAGE_W, PAGE_H], 'portrait')
    doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, PAGE_W, PAGE_H)
  })
  return doc.output('blob')
}

export async function exportCyclePdf(input: ExportCycleInput): Promise<Blob> {
  return canvasesToPdf(await buildCyclePdfCanvases(input))
}

export async function exportCycleGuidePdf(input: {
  pathId: string
  locale: 'en' | 'pt-BR'
}): Promise<Blob> {
  return exportCyclePdf({
    pathId: input.pathId,
    locale: input.locale,
    mode: 'guide',
    nextRebirth: 1,
    completedOnPath: 0,
    inventory: [],
  })
}

export async function exportCycleProgressPdf(
  input: Omit<ExportCycleInput, 'mode'>,
): Promise<Blob> {
  return exportCyclePdf({ ...input, mode: 'progress' })
}

export async function exportCyclePngChunks(input: ExportCycleInput): Promise<Blob[]> {
  applyExportLocale(input.locale)
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return []

  const pages = await renderRebirthPages(input)
  const chunks: Blob[] = []
  for (const canvas of pages) {
    chunks.push(
      await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png')
      }),
    )
  }
  return chunks
}

export async function exportCycleCoverBlob(input: ExportCycleInput): Promise<Blob> {
  applyExportLocale(input.locale)
  const { canvas, ctx } = createPageCanvas()
  await drawCover(ctx, input)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png')
  })
}
