import { APP_BRAND_NAME } from './brand'
import { APP_PUBLIC_URL, REPORT_FEEDBACK_URL } from './constants'
import { formatCycleDisplayName } from './cycleLabel'
import { droidImageSrc } from './images'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import { fusionsRelevantToPath, unitsNewlySellableAfterRebirth } from '../domain/rebirthSellPlan'
import { buildTierLabelMap, formatTierName } from '../domain/tiers'
import type { InventoryUnit, RebirthEntry } from '../domain/types'

export interface ExportCycleInput {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory: InventoryUnit[]
  locale: 'en' | 'pt-BR'
}

const PAGE_W = 794
const PAGE_H = 1123
const PAD = 40
const FOOTER_H = 72
const COL_GAP = 14
const ROW_GAP = 14
const COLS = 2
const ROWS_PER_PAGE = 4
const REBIRTHS_PER_PAGE = COLS * ROWS_PER_PAGE
const CARD_W = (PAGE_W - PAD * 2 - COL_GAP) / 2
const CARD_H = 228

const tierLabels = buildTierLabelMap(gameData.rarities)

const copy = {
  en: {
    myCycle: (name: string) => `My ${name}`,
    brand: APP_BRAND_NAME,
    rebirthsDone: 'Rebirths done',
    pathPct: 'Cycle progress',
    nextRebirth: 'Next rebirth',
    inventory: 'Units in inventory',
    nextReqs: 'Next rebirth needs',
    date: 'Generated',
    rebirth: 'Rebirth',
    credits: 'Credits',
    sellAfter: 'Sell after:',
    done: 'Done',
    next: 'Current',
    pending: 'Upcoming',
    footer: 'Fan-made · not affiliated with Epic Games',
    superTitle: 'Super Rebirth',
    superBody: `Available after rebirth ${SUPER_REBIRTH_UNLOCK_AFTER}. Resets credits, base upgrades, and most droids (Iconics stay).`,
    fusionTitle: 'Fusion recipes on this cycle',
    feedbackLink: 'Feedback on WhatsApp',
    noneSell: '—',
  },
  'pt-BR': {
    myCycle: (name: string) => `Meu ${name}`,
    brand: APP_BRAND_NAME,
    rebirthsDone: 'Rebirths concluídos',
    pathPct: '% do ciclo',
    nextRebirth: 'Próximo rebirth',
    inventory: 'Droids no inventário',
    nextReqs: 'Requisitos do próximo rebirth',
    date: 'Gerado em',
    rebirth: 'Rebirth',
    credits: 'Créditos',
    sellAfter: 'Vende depois:',
    done: 'Feito',
    next: 'Atual',
    pending: 'Próximos',
    footer: 'Fan-made · não afiliado à Epic Games',
    superTitle: 'Super Rebirth',
    superBody: `Libera depois do rebirth ${SUPER_REBIRTH_UNLOCK_AFTER}. Zera créditos, upgrades da base e quase todos os droids (Iconics ficam).`,
    fusionTitle: 'Receitas de fusão neste ciclo',
    feedbackLink: 'Feedback no WhatsApp',
    noneSell: '—',
  },
} as const

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

async function drawFooter(ctx: CanvasRenderingContext2D, locale: 'en' | 'pt-BR', qrDataUrl: string) {
  const y = PAGE_H - FOOTER_H
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(0, y, PAGE_W, FOOTER_H)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '13px system-ui, sans-serif'
  ctx.fillText(APP_PUBLIC_URL.replace('https://', ''), PAD, y + 26)
  ctx.fillStyle = '#64748b'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(copy[locale].footer, PAD, y + 44)
  if (REPORT_FEEDBACK_URL) {
    ctx.fillText(copy[locale].feedbackLink, PAD, y + 58)
  }

  const logo = await loadImage('/pwa-192.png')
  if (logo) ctx.drawImage(logo, PAGE_W - PAD - 108, y + 12, 36, 36)

  const qrImg = await loadImage(qrDataUrl)
  if (qrImg) ctx.drawImage(qrImg, PAGE_W - PAD - 52, y + 10, 44, 44)
}

async function makeQr(): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(APP_PUBLIC_URL, {
    margin: 1,
    width: 128,
    color: { dark: '#e2e8f0', light: '#0c121c' },
  })
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
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(label, x + 14, y + 28)
  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(value, x + 14, y + 62)
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

async function drawCover(ctx: CanvasRenderingContext2D, input: ExportCycleInput, qr: string) {
  fillBackground(ctx)
  const L = copy[input.locale]
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
  if (logo) ctx.drawImage(logo, PAD, headerY, 112, 112)

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillText(L.brand, PAD + 128, headerY + 44)
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillStyle = '#a5b4fc'
  ctx.fillText(L.myCycle(pathName), PAD + 128, headerY + 88)

  const gridY = headerY + 132
  const blockW = (PAGE_W - PAD * 2 - COL_GAP) / 2
  const blockH = 78
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

  const stripY = gridY + (blockH + COL_GAP) * 2 + 20
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 15px system-ui, sans-serif'
  ctx.fillText(L.nextReqs, PAD, stripY)

  const nextEntry = getRebirth(input.pathId, input.nextRebirth)
  let sx = PAD
  const stripRowY = stripY + 16
  if (nextEntry) {
    for (const req of nextEntry.requirements.slice(0, 3)) {
      const droid = droidById.get(req.droidId)
      const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
      if (img) ctx.drawImage(img, sx, stripRowY, 56, 56)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '13px system-ui, sans-serif'
      const name = droid?.name ?? req.droidId
      const tier = formatTierName(req.rarity, tierLabels)
      ctx.fillText(name.length > 14 ? `${name.slice(0, 13)}…` : name, sx, stripRowY + 72)
      ctx.fillStyle = '#818cf8'
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillText(tier, sx, stripRowY + 88)
      sx += 120
    }
  }

  const dateStr = new Date().toLocaleDateString(input.locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  ctx.fillStyle = '#94a3b8'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(`${L.date}: ${dateStr}`, PAD, PAGE_H - FOOTER_H - 24)

  await drawFooter(ctx, input.locale, qr)
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
  ctx.font = '10px system-ui, sans-serif'
  const tw = ctx.measureText(label).width
  const pw = tw + 14
  ctx.fillStyle = colors.bg
  roundRect(ctx, x, y - 11, pw, 18, 6)
  ctx.fill()
  ctx.fillStyle = colors.fg
  ctx.fillText(label, x + 7, y + 2)
  return pw
}

async function drawCompactRebirthCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  entry: RebirthEntry,
  input: ExportCycleInput,
) {
  const L = copy[input.locale]
  const status = rebirthStatus(entry.rebirth, input)
  const statusLabel =
    status === 'done' ? L.done : status === 'next' ? L.next : L.pending

  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, x, y, CARD_W, CARD_H, 10)
  ctx.fill()
  ctx.stroke()

  const innerX = x + 10
  let cy = y + 22
  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 14px system-ui, sans-serif'
  const title = `${L.rebirth} ${entry.rebirth}`
  ctx.fillText(title, innerX, cy)
  const chipX = innerX + ctx.measureText(title).width + 8
  drawStatusChip(ctx, chipX, cy, statusLabel, status)

  cy += 18
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(`${L.credits}: ${entry.credits}`, innerX, cy)

  cy += 10
  for (const req of entry.requirements.slice(0, 3)) {
    cy += 22
    const droid = droidById.get(req.droidId)
    const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
    if (img) ctx.drawImage(img, innerX, cy - 16, 28, 28)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '10px system-ui, sans-serif'
    const name = droid?.name ?? req.droidId
    const shortName = name.length > 16 ? `${name.slice(0, 15)}…` : name
    ctx.fillText(shortName, innerX + 34, cy)
    ctx.fillStyle = '#818cf8'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText(formatTierName(req.rarity, tierLabels), innerX + 34, cy + 11)
  }

  cy += 28
  ctx.fillStyle = '#a5b4fc'
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.fillText(L.sellAfter, innerX, cy)

  const sellUnits = unitsNewlySellableAfterRebirth(input.pathId, entry.rebirth).filter(
    (u) => u.disposition === 'sellable',
  )
  let sellX = innerX + ctx.measureText(L.sellAfter).width + 4
  if (sellUnits.length === 0) {
    ctx.fillStyle = '#64748b'
    ctx.font = '10px system-ui, sans-serif'
    ctx.fillText(L.noneSell, sellX, cy)
  } else {
    for (const unit of sellUnits.slice(0, 4)) {
      const droid = droidById.get(unit.droidId)
      if (!droid) continue
      const img = await loadImage(droidImageSrc(droid.id, droid.imageLocal))
      if (img) ctx.drawImage(img, sellX, cy - 14, 24, 24)
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '8px system-ui, sans-serif'
      const tier = formatTierName(unit.tier, tierLabels)
      const label = tier.length > 8 ? tier.slice(0, 7) : tier
      ctx.fillText(label, sellX, cy + 16)
      sellX += 36
    }
  }
}

async function renderRebirthPages(input: ExportCycleInput, qr: string): Promise<HTMLCanvasElement[]> {
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
      await drawFooter(ctx, input.locale, qr)
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
      await drawFooter(ctx, input.locale, qr)
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

  await drawFooter(ctx, input.locale, qr)
  pages.push(canvas)
  return pages
}

async function renderAppendix(input: ExportCycleInput, qr: string): Promise<HTMLCanvasElement> {
  const { canvas, ctx } = createPageCanvas()
  fillBackground(ctx)
  const L = copy[input.locale]
  let y = PAD

  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.fillText(L.superTitle, PAD, y)
  y += 36
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '16px system-ui, sans-serif'
  wrapText(ctx, L.superBody, PAD, y, PAGE_W - PAD * 2, 22)
  y += 80

  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(L.fusionTitle, PAD, y)
  y += 32

  const fusions = fusionsRelevantToPath(input.pathId).slice(0, 12)
  ctx.font = '14px system-ui, sans-serif'
  for (const f of fusions) {
    const result = droidById.get(f.resultDroidId)?.name ?? f.resultDroidId
    const ings = f.ingredients
      .map((i) => `${droidById.get(i.droidId)?.name ?? i.droidId}×${i.quantity}`)
      .join(' + ')
    ctx.fillStyle = '#e2e8f0'
    wrapText(ctx, `→ ${result}: ${ings}`, PAD, y, PAGE_W - PAD * 2, 20)
    y += 36
  }

  await drawFooter(ctx, input.locale, qr)
  return canvas
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
  const qr = await makeQr()
  const { canvas, ctx } = createPageCanvas()
  await drawCover(ctx, input, qr)
  const cover = canvas
  const rebirthPages = await renderRebirthPages(input, qr)
  const appendix = await renderAppendix(input, qr)
  return canvasesToPdf([cover, ...rebirthPages, appendix])
}

export async function exportCyclePngChunks(input: ExportCycleInput): Promise<Blob[]> {
  const qr = await makeQr()
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return []

  const pages = await renderRebirthPages(input, qr)
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

/** Test hook: render cover only. */
export async function exportCycleCoverBlob(input: ExportCycleInput): Promise<Blob> {
  const qr = await makeQr()
  const { canvas, ctx } = createPageCanvas()
  await drawCover(ctx, input, qr)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png')
  })
}
