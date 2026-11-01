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
  const coverLine =
    (input.mode ?? 'progress') === 'guide'
      ? `${p.guideCoverTitle}: ${pathName}`
      : `${p.progressCoverTitle}: ${pathName}`
  return {
    ...p,
    brand: APP_BRAND_NAME,
    myCycle: (_name: string) => coverLine,
    date: p.generated.replace('{{date}}', formatPdfDate(input.locale)),
  }
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
  const g = ctx.createLinearGradient(0, 0, PAGE_W, PAGE_H)
  g.addColorStop(0, '#0c121c')
  g.addColorStop(1, '#070b12')
  ctx.fillStyle = g
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
  ctx.fillStyle = '#64748b'
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
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 10)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#64748b'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(label, x + 12, y + 24)
  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.fillText(value, x + 12, y + 52)
}

function unitChipLabel(droidId: string, tier: string): string {
  const droid = droidById.get(droidId)
  const name = droid?.name ?? droidId
  const short = name.length > 10 ? `${name.slice(0, 9)}…` : name
  const tierShort = tier.length > 12 ? `${tier.slice(0, 11)}…` : tier
  return `${short} · ${tierShort}`
}

function drawTextChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  maxWidth: number,
): number {
  ctx.font = '9px system-ui, sans-serif'
  let label = text
  while (label.length > 3 && ctx.measureText(label).width > maxWidth) {
    label = `${label.slice(0, -2)}…`
  }
  const tw = ctx.measureText(label).width
  const pw = tw + 10
  const ph = 16
  ctx.fillStyle = 'rgba(129,140,248,0.18)'
  roundRect(ctx, x, y, pw, ph, 5)
  ctx.fill()
  ctx.fillStyle = '#e2e8f0'
  ctx.fillText(label, x + 5, y + 11)
  return pw + 4
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
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '10px system-ui, sans-serif'
  const nameMax = maxW - 38 - 70
  let displayName = name
  while (displayName.length > 2 && ctx.measureText(displayName).width > nameMax) {
    displayName = `${displayName.slice(0, -2)}…`
  }
  ctx.fillText(displayName, x + 34, y + 18)
  drawTextChip(ctx, x + 34 + ctx.measureText(displayName).width + 6, y + 4, tier, 68)
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
    ctx.fillStyle = '#64748b'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText(emptyLabel, x, y + 10)
    return 14
  }
  let cx = x
  let cy = y
  for (const unit of units.slice(0, 8)) {
    const tier = formatTierName(unit.tier, exportTierLabels)
    const chip = unitChipLabel(unit.droidId, tier)
    const chipW = Math.min(maxW, 120)
    if (cx + chipW > x + maxW && cx > x) {
      cx = x
      cy += 20
    }
    const used = drawTextChip(ctx, cx, cy, chip, chipW)
    cx += used
  }
  return cy - y + 18
}

async function drawMiniDroidChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  droidId: string,
  tierId: string,
): Promise<number> {
  const droid = droidById.get(droidId)
  const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
  if (img) ctx.drawImage(img, x, y, 20, 20)
  const tier = formatTierName(tierId as RebirthUnitUsage['tier'], exportTierLabels)
  const chip = unitChipLabel(droidId, tier)
  return drawTextChip(ctx, x + 24, y + 2, chip, 96) + 24
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
    h += 14 + entry.requirements.length * 22 + 6
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
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 10px system-ui, sans-serif'
    ctx.fillText(`${L.rebirth} ${r} · ${entry.credits}`, x, uy + 10)
    uy += 14
    let cx = x
    for (const req of entry.requirements) {
      if (cx + 120 > x + w) {
        cx = x
        uy += 22
      }
      const used = await drawMiniDroidChip(ctx, cx, uy, req.droidId, req.rarity)
      cx += used + 2
    }
    uy += 26
  }
}

const TABLE_ROW_H = 26

async function drawRemainingTable(
  ctx: CanvasRenderingContext2D,
  y: number,
  input: ExportCycleInput,
  L: ReturnType<typeof labels>,
  tableStartRebirth: number,
  maxY: number,
): Promise<number> {
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 13px system-ui, sans-serif'
  ctx.fillText(L.remainingRebirths, PAD + 12, y + 16)
  let ry = y + 28
  const innerW = PAGE_W - PAD * 2 - 24

  for (let r = tableStartRebirth; r <= REBIRTHS_PER_PATH; r++) {
    if (ry + TABLE_ROW_H > maxY) break
    const entry = getRebirth(input.pathId, r)
    if (!entry) continue

    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    roundRect(ctx, PAD, ry - 2, PAGE_W - PAD * 2, TABLE_ROW_H - 4, 6)
    ctx.fill()

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 10px system-ui, sans-serif'
    ctx.fillText(`#${r}`, PAD + 12, ry + 14)
    ctx.fillStyle = '#64748b'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText(entry.credits, PAD + 44, ry + 14)

    let cx = PAD + 118
    for (const req of entry.requirements) {
      if (cx + 100 > PAD + innerW) break
      const used = await drawMiniDroidChip(ctx, cx, ry + 2, req.droidId, req.rarity)
      cx += used + 2
    }
    ry += TABLE_ROW_H
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

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillText(L.brand, PAD + 112, headerY + 38)
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillStyle = '#a5b4fc'
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
  const sellInnerH =
    sellNowUnits.length === 0
      ? 14
      : Math.ceil(Math.min(sellNowUnits.length, 8) / 2) * 20 + 8
  const upcomingInnerH = await measureUpcomingHeight(
    input.pathId,
    input.nextRebirth,
    upcomingEnd,
  )
  const panelInnerH = Math.max(sellInnerH, upcomingInnerH)
  const panelH = 22 + panelInnerH + 14

  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  roundRect(ctx, PAD, panelY, panelW, panelH, 10)
  ctx.fill()
  ctx.fillStyle = '#cbd5e1'
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
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  roundRect(ctx, rightX, panelY, panelW, panelH, 10)
  ctx.fill()
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 13px system-ui, sans-serif'
  ctx.fillText(L.upcomingRebirths, rightX + 12, panelY + 20)
  await drawUpcomingRebirths(ctx, rightX + 12, panelY + 26, panelW - 24, input, L)

  const tableY = panelY + panelH + 14
  const maxTableY = PAGE_H - FOOTER_H - 30
  if (tableStart <= REBIRTHS_PER_PATH && tableY + 40 < maxTableY) {
    await drawRemainingTable(ctx, tableY, input, L, tableStart, maxTableY)
  }

  const dateStr = new Date().toLocaleDateString(input.locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  ctx.fillStyle = '#94a3b8'
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
    done: { bg: 'rgba(34,197,94,0.2)', fg: '#86efac' },
    next: { bg: 'rgba(129,140,248,0.25)', fg: '#c7d2fe' },
    pending: { bg: 'rgba(148,163,184,0.15)', fg: '#94a3b8' },
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

  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, x, y, CARD_W, CARD_H, 10)
  ctx.fill()
  ctx.stroke()

  const innerX = x + 8
  const innerW = CARD_W - 16
  let cy = y + 18
  ctx.fillStyle = '#f1f5f9'
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
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px system-ui, sans-serif'
  ctx.fillText(`${L.credits}: ${entry.credits}`, innerX, cy)

  cy += 8
  for (const req of entry.requirements.slice(0, 3)) {
    cy += DROID_ROW_H
    await drawDroidRow(ctx, innerX, cy - DROID_ROW_H + 2, innerW, req.droidId, req.rarity)
  }

  if (!isGuide) {
    cy += 6
    ctx.fillStyle = '#a5b4fc'
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

async function drawGuideCover(ctx: CanvasRenderingContext2D, input: ExportCycleInput) {
  const L = labels(input)
  const pathName = formatCycleDisplayName(
    cycleById.get(input.pathId)?.name ?? input.pathId,
    input.locale,
  )
  const logo = await loadImage('/pwa-512.png')
  if (logo) ctx.drawImage(logo, PAD, PAD, 88, 88)
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText(L.brand, PAD + 104, PAD + 40)
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillStyle = '#a5b4fc'
  ctx.fillText(`${L.guideCoverTitle}: ${pathName}`, PAD + 104, PAD + 76)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(L.date, PAD, PAD + 120)
  ctx.fillText(
    L.dataVersion
      .replace('{{version}}', gameData.dataVersion)
      .replace('{{game}}', gameData.gameVersion),
    PAD,
    PAD + 142,
  )
  ctx.fillStyle = '#64748b'
  ctx.font = '11px system-ui, sans-serif'
  wrapText(ctx, L.disclaimer, PAD, PAGE_H - PAD - 48, PAGE_W - PAD * 2, 16)
}

function drawTocPage(ctx: CanvasRenderingContext2D, input: ExportCycleInput, rebirthSheets: number) {
  const L = labels(input)
  let y = PAD + 8
  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText(L.tocTitle, PAD, y)
  y += 40
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '15px system-ui, sans-serif'
  const lines = [
    `3–${2 + rebirthSheets}. ${L.tocRebirths.replace('{{n}}', String(REBIRTHS_PER_PATH))}`,
    `${3 + rebirthSheets}. ${L.tocSuper}`,
    `${4 + rebirthSheets}. ${L.tocClosing}`,
  ]
  for (const line of lines) {
    ctx.fillText(line, PAD + 8, y)
    y += 28
  }
}

function drawClosingPage(ctx: CanvasRenderingContext2D, input: ExportCycleInput) {
  const L = labels(input)
  let y = PAD
  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.fillText(L.closingTitle, PAD, y)
  y += 36
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '16px system-ui, sans-serif'
  wrapText(
    ctx,
    L.superBody.replace('{{n}}', String(SUPER_REBIRTH_UNLOCK_AFTER)),
    PAD,
    y,
    PAGE_W - PAD * 2,
    22,
  )
  y += 72
  ctx.fillStyle = '#94a3b8'
  ctx.font = '13px system-ui, sans-serif'
  wrapText(ctx, L.disclaimer, PAD, y, PAGE_W - PAD * 2, 18)
  y += 56
  wrapText(ctx, L.sources, PAD, y, PAGE_W - PAD * 2, 18)
  y += 48
  ctx.fillStyle = '#64748b'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(APP_PUBLIC_URL.replace('https://', ''), PAD, y)
}

export async function buildCyclePdfCanvases(input: ExportCycleInput): Promise<HTMLCanvasElement[]> {
  applyExportLocale(input.locale)
  const mode = input.mode ?? 'progress'
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return []

  const rebirthSheets = countRebirthSheetPages(cycle.rebirths.length)
  const totalPages = (mode === 'guide' ? 2 : 1) + rebirthSheets + 1
  let pageNum = 0
  const out: HTMLCanvasElement[] = []

  const stamp = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    pageNum++
    drawPageFooter(ctx, input, pageNum, totalPages)
    out.push(canvas)
  }

  if (mode === 'guide') {
    const g1 = createPageCanvas()
    fillBackground(g1.ctx)
    await drawGuideCover(g1.ctx, input)
    stamp(g1.canvas, g1.ctx)

    const g2 = createPageCanvas()
    fillBackground(g2.ctx)
    drawTocPage(g2.ctx, input, rebirthSheets)
    stamp(g2.canvas, g2.ctx)
  } else {
    const cover = createPageCanvas()
    fillBackground(cover.ctx)
    await drawCover(cover.ctx, input)
    stamp(cover.canvas, cover.ctx)
  }

  const rebirthPages = await renderRebirthPages(input)
  for (const canvas of rebirthPages) {
    const ctx = canvas.getContext('2d')
    if (ctx) stamp(canvas, ctx)
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
