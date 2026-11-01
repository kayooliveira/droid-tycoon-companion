import { APP_BRAND_NAME } from './brand'
import { APP_PUBLIC_URL, REPORT_FEEDBACK_URL } from './constants'
import { formatCycleDisplayName } from './cycleLabel'
import { droidImageSrc } from './images'
import { cycleById, droidById, gameData } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import { unitsSellableAfterRebirth, fusionsRelevantToPath } from '../domain/rebirthSellPlan'
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
const PAD = 48
const FOOTER_H = 88

const tierLabels = buildTierLabelMap(gameData.rarities)

const copy = {
  en: {
    title: 'My Droid Tycoon cycle',
    cycle: 'Path',
    brand: APP_BRAND_NAME,
    progress: 'Progress',
    rebirthsDone: 'Rebirths completed',
    pathPct: 'Path progress',
    date: 'Generated on',
    rebirth: 'Rebirth',
    credits: 'Credits',
    requirements: 'Requirements',
    sellAfter: 'Safe to sell after this rebirth',
    done: 'Done',
    next: 'Next up',
    pending: 'Upcoming',
    footer: 'Fan-made · not affiliated with Epic Games',
    superTitle: 'Super Rebirth',
    superBody: `Available after rebirth ${SUPER_REBIRTH_UNLOCK_AFTER}. Resets credits, base upgrades, and most droids (Iconics stay).`,
    fusionTitle: 'Fusion recipes on this Path',
    feedbackLink: 'Feedback on WhatsApp',
    noneSell: 'Nothing to free up from requirements here.',
  },
  'pt-BR': {
    title: 'Meu ciclo no Droid Tycoon',
    cycle: 'Ciclo',
    brand: APP_BRAND_NAME,
    progress: 'Progresso',
    rebirthsDone: 'Rebirths concluídos',
    pathPct: 'Progresso do ciclo',
    date: 'Gerado em',
    rebirth: 'Rebirth',
    credits: 'Créditos',
    requirements: 'Requisitos',
    sellAfter: 'Depois desse rebirth dá pra vender',
    done: 'Feito',
    next: 'Atual',
    pending: 'Por vir',
    footer: 'Fan-made · não afiliado à Epic Games',
    superTitle: 'Super Rebirth',
    superBody: `Libera depois do rebirth ${SUPER_REBIRTH_UNLOCK_AFTER}. Zera créditos, upgrades da base e quase todos os droids (Iconics ficam).`,
    fusionTitle: 'Receitas de fusão neste ciclo',
    feedbackLink: 'Feedback no WhatsApp',
    noneSell: 'Nada pra liberar dos requisitos aqui.',
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

async function drawFooter(ctx: CanvasRenderingContext2D, locale: 'en' | 'pt-BR', qrDataUrl: string) {
  const y = PAGE_H - FOOTER_H
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(0, y, PAGE_W, FOOTER_H)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(APP_PUBLIC_URL.replace('https://', ''), PAD, y + 28)
  ctx.fillText(copy[locale].footer, PAD, y + 48)
  if (REPORT_FEEDBACK_URL) {
    ctx.fillStyle = '#64748b'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(copy[locale].feedbackLink, PAD, y + 64)
  }

  const logo = await loadImage('/pwa-192.png')
  if (logo) ctx.drawImage(logo, PAGE_W - PAD - 120, y + 10, 40, 40)

  const qrImg = await loadImage(qrDataUrl)
  if (qrImg) ctx.drawImage(qrImg, PAGE_W - PAD - 56, y + 8, 48, 48)
}

async function makeQr(): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(APP_PUBLIC_URL, {
    margin: 1,
    width: 128,
    color: { dark: '#e2e8f0', light: '#0c121c' },
  })
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

  const logo = await loadImage('/pwa-512.png')
  if (logo) ctx.drawImage(logo, PAD, PAD, 96, 96)

  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 40px system-ui, sans-serif'
  ctx.fillText(L.brand, PAD, PAD + 140)

  ctx.font = '22px system-ui, sans-serif'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText(L.title, PAD, PAD + 178)
  ctx.fillText(`${L.cycle}: ${pathName}`, PAD, PAD + 210)
  ctx.fillText(`${L.rebirthsDone}: ${input.completedOnPath} / ${REBIRTHS_PER_PATH}`, PAD, PAD + 250)
  ctx.fillText(`${L.pathPct}: ${pct.toFixed(0)}%`, PAD, PAD + 290)

  const dateStr = new Date().toLocaleDateString(input.locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  ctx.fillText(`${L.date}: ${dateStr}`, PAD, PAD + 330)

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

async function drawRebirthRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  entry: RebirthEntry,
  input: ExportCycleInput,
): Promise<number> {
  const L = copy[input.locale]
  const status = rebirthStatus(entry.rebirth, input)
  const statusLabel =
    status === 'done' ? L.done : status === 'next' ? L.next : L.pending

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.fillText(`${L.rebirth} ${entry.rebirth} · ${statusLabel}`, x, y)
  y += 8
  ctx.fillStyle = '#94a3b8'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(`${L.credits}: ${entry.credits}`, x, y + 18)

  let rowY = y + 36
  for (const req of entry.requirements) {
    const droid = droidById.get(req.droidId)
    const img = droid ? await loadImage(droidImageSrc(droid.id, droid.imageLocal)) : null
    if (img) ctx.drawImage(img, x, rowY, 40, 40)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '15px system-ui, sans-serif'
    const name = droid?.name ?? req.droidId
    const tier = formatTierName(req.rarity, tierLabels)
    ctx.fillText(`${name} (${tier})`, x + 48, rowY + 26)
    rowY += 48
  }

  const sellUnits = unitsSellableAfterRebirth(input.pathId, entry.rebirth).filter(
    (u) => u.disposition === 'sellable',
  )
  rowY += 8
  ctx.fillStyle = '#a5b4fc'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.fillText(L.sellAfter, x, rowY + 14)
  rowY += 28
  if (sellUnits.length === 0) {
    ctx.fillStyle = '#64748b'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(L.noneSell, x, rowY + 12)
    rowY += 24
  } else {
    let col = 0
    for (const unit of sellUnits.slice(0, 8)) {
      const droid = droidById.get(unit.droidId)
      if (!droid) continue
      const img = await loadImage(droidImageSrc(droid.id, droid.imageLocal))
      const cx = x + col * 88
      if (img) ctx.drawImage(img, cx, rowY, 36, 36)
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillText(formatTierName(unit.tier, tierLabels), cx, rowY + 50)
      col++
      if (col >= 4) {
        col = 0
        rowY += 58
      }
    }
    if (col > 0) rowY += 58
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.moveTo(x, rowY + 12)
  ctx.lineTo(x + width, rowY + 12)
  ctx.stroke()

  return rowY + 28
}

async function renderRebirthPages(input: ExportCycleInput, qr: string): Promise<HTMLCanvasElement[]> {
  const cycle = cycleById.get(input.pathId)
  if (!cycle) return []

  const pages: HTMLCanvasElement[] = []
  let { canvas, ctx } = createPageCanvas()
  fillBackground(ctx)
  let y = PAD

  for (const entry of cycle.rebirths) {
    const needed = await measureRebirthBlock(entry, input)
    if (y + needed > PAGE_H - FOOTER_H - PAD) {
      await drawFooter(ctx, input.locale, qr)
      pages.push(canvas)
      ;({ canvas, ctx } = createPageCanvas())
      fillBackground(ctx)
      y = PAD
    }
    y = await drawRebirthRow(ctx, PAD, y, PAGE_W - PAD * 2, entry, input)
  }

  await drawFooter(ctx, input.locale, qr)
  pages.push(canvas)
  return pages
}

async function measureRebirthBlock(entry: RebirthEntry, input: ExportCycleInput): Promise<number> {
  const sellCount = unitsSellableAfterRebirth(input.pathId, entry.rebirth).filter(
    (u) => u.disposition === 'sellable',
  ).length
  const sellRows = sellCount === 0 ? 1 : Math.ceil(Math.min(sellCount, 8) / 4)
  return 36 + entry.requirements.length * 48 + 28 + sellRows * 58 + 40
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

  const chunks: Blob[] = []
  const chunkSize = 10

  for (let start = 0; start < cycle.rebirths.length; start += chunkSize) {
    const slice = cycle.rebirths.slice(start, start + chunkSize)
    const height = PAD * 2 + FOOTER_H + slice.length * 220
    const canvas = document.createElement('canvas')
    canvas.width = 780
    canvas.height = Math.max(height, 400)
    const ctx = canvas.getContext('2d')!
    fillBackground(ctx)
    let y = PAD
    const pathName = formatCycleDisplayName(
      cycleById.get(input.pathId)?.name ?? input.pathId,
      input.locale,
    )
    ctx.fillStyle = '#f1f5f9'
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillText(`${copy[input.locale].brand} · ${pathName}`, PAD, y)
    y += 40

    for (const entry of slice) {
      y = await drawRebirthRow(ctx, PAD, y, canvas.width - PAD * 2, entry, input)
    }
    await drawFooter(ctx, input.locale, qr)
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
