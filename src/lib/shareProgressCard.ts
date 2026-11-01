import { APP_BRAND_NAME } from './brand'
import { formatCycleDisplayName } from './cycleLabel'
import { cycleById, droidById, getRebirth } from '../domain/gameData'
import { pathProgressPercent } from '../domain/progress'
import type { InventoryUnit } from '../domain/types'
import { droidImageSrc } from './images'
import {
  assertShareCardLayoutInBounds,
  CARD_BORDER,
  planShareCardLayout,
  SECTION_GAP,
  SHARE_CARD_SIZE,
} from './shareProgressCardLayout'

export interface ShareCardInput {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory: InventoryUnit[]
  locale: 'en' | 'pt-BR'
}

export {
  assertShareCardLayoutInBounds,
  CARD_BORDER,
  CARD_INNER_PAD,
  planShareCardLayout,
  SECTION_GAP,
  SHARE_CARD_SIZE,
} from './shareProgressCardLayout'

function inventoryDroidCount(inventory: InventoryUnit[]): number {
  return new Set(inventory.map((u) => u.droidId)).size
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number,
) {
  const aspect = img.width / img.height
  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0
  if (aspect > 1) {
    sw = img.height
    sx = (img.width - sw) / 2
  } else if (aspect < 1) {
    sh = img.width
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, size, size)
}

export async function renderShareProgressCard(data: ShareCardInput): Promise<Blob> {
  const width = SHARE_CARD_SIZE
  const height = SHARE_CARD_SIZE
  const plan = planShareCardLayout()
  assertShareCardLayoutInBounds(plan)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const isPt = data.locale === 'pt-BR'
  const pathName = formatCycleDisplayName(
    cycleById.get(data.pathId)?.name ?? data.pathId,
    data.locale,
  )
  const pathPct = pathProgressPercent({
    pathId: data.pathId,
    nextRebirth: data.nextRebirth,
    completedOnPath: data.completedOnPath,
  })
  const invCount = inventoryDroidCount(data.inventory)
  const next = getRebirth(data.pathId, data.nextRebirth)
  const reqDroids = next?.requirements.map((r) => droidById.get(r.droidId)).filter(Boolean) ?? []

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#070b12')
  bg.addColorStop(0.5, '#0c121c')
  bg.addColorStop(1, '#101827')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const cardX = CARD_BORDER
  const cardY = CARD_BORDER
  const cardW = width - 2 * CARD_BORDER
  const cardH = height - 2 * CARD_BORDER
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  roundRect(ctx, cardX, cardY, cardW, cardH, 32)
  ctx.fill()
  ctx.strokeStyle = 'rgba(89,163,255,0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  const { cardInnerLeft: ix, cardInnerTop: iy, cardInnerWidth: iw } = plan
  const logoSize = 112
  const logo = await loadImage('/pwa-512.png')
  if (logo) {
    ctx.save()
    roundRect(ctx, ix, iy, logoSize, logoSize, 24)
    ctx.clip()
    drawCoverImage(ctx, logo, ix, iy, logoSize)
    ctx.restore()
  }

  const titleX = ix + logoSize + 24
  ctx.fillStyle = '#fafafa'
  ctx.font = '700 38px system-ui, sans-serif'
  ctx.fillText(APP_BRAND_NAME, titleX, iy + 44)
  ctx.fillStyle = '#a1a1aa'
  ctx.font = '22px system-ui, sans-serif'
  ctx.fillText('Companion for Star Wars Droid Tycoon', titleX, iy + 78)
  ctx.fillStyle = '#71717a'
  ctx.font = '26px system-ui, sans-serif'
  const cycleLabel = isPt ? 'Ciclo' : 'Path'
  ctx.fillText(`${cycleLabel} · ${pathName}`, titleX, iy + 88)

  const nextY = iy + 128 + SECTION_GAP
  const nextLabel = isPt
    ? `Próximo rebirth #${Math.min(data.nextRebirth, 40)}`
    : `Next rebirth #${Math.min(data.nextRebirth, 40)}`
  ctx.fillStyle = '#e4e4e7'
  ctx.font = '600 32px system-ui, sans-serif'
  ctx.fillText(nextLabel, ix, nextY + 32)

  const nameBand = 36
  const imgPad = 12
  const imgSize = plan.droidsH - nameBand - imgPad * 2
  const droidImgs = await Promise.all(
    reqDroids.slice(0, 3).map(async (d) => {
      if (!d) return null
      return loadImage(droidImageSrc(d.id, d.imageLocal))
    }),
  )

  for (let i = 0; i < 3; i++) {
    const x = ix + i * (plan.droidTileW + plan.droidColGap)
    const y = plan.droidsY
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    roundRect(ctx, x, y, plan.droidTileW, plan.droidsH, 18)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()

    const img = droidImgs[i]
    const d = reqDroids[i]
    const imgX = x + (plan.droidTileW - imgSize) / 2
    const imgY = y + imgPad
    if (img && d) {
      ctx.save()
      roundRect(ctx, imgX, imgY, imgSize, imgSize, 14)
      ctx.clip()
      drawCoverImage(ctx, img, imgX, imgY, imgSize)
      ctx.restore()
      ctx.fillStyle = '#d4d4d8'
      ctx.font = '22px system-ui, sans-serif'
      const name = d.name.length > 16 ? `${d.name.slice(0, 15)}…` : d.name
      ctx.fillText(name, x + 14, y + plan.droidsH - 12)
    } else {
      ctx.fillStyle = '#52525b'
      ctx.font = '28px system-ui, sans-serif'
      ctx.fillText('—', x + plan.droidTileW / 2 - 10, y + plan.droidsH / 2)
    }
  }

  const statW = iw / 3
  const valueFont = '700 58px system-ui, sans-serif'
  const suffixFont = '500 32px system-ui, sans-serif'
  const subFont = '22px system-ui, sans-serif'
  const statBaseline = plan.statsY + 72

  const statDefs = [
    { kind: 'rebirth' as const, sub: isPt ? 'rebirths feitos' : 'rebirths done' },
    {
      kind: 'pct' as const,
      value: `${Math.round(pathPct)}%`,
      sub: isPt ? 'progresso do ciclo' : 'path progress',
    },
    {
      kind: 'inv' as const,
      value: `${invCount}`,
      sub: isPt ? 'droids no inventário' : 'droids in inventory',
    },
  ]

  statDefs.forEach((s, i) => {
    const x = ix + i * statW
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, x, plan.statsY, statW - 12, plan.statsH, 14)
    ctx.fill()
    const padX = x + 16
    if (s.kind === 'rebirth') {
      const value = String(data.completedOnPath)
      const suffix = '/40'
      ctx.font = valueFont
      const valueW = ctx.measureText(value).width
      ctx.fillStyle = '#5eead4'
      ctx.fillText(value, padX, statBaseline)
      ctx.font = suffixFont
      ctx.fillStyle = '#71717a'
      ctx.fillText(suffix, padX + valueW + 8, statBaseline - 2)
    } else {
      ctx.font = valueFont
      ctx.fillStyle = '#5eead4'
      ctx.fillText(s.value!, padX, statBaseline)
    }
    ctx.fillStyle = '#a1a1aa'
    ctx.font = subFont
    ctx.fillText(s.sub, padX, plan.statsY + plan.statsH - 18)
  })

  const barX = ix
  const barW = iw
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, barX, plan.barY, barW, plan.barH, 12)
  ctx.fill()
  if (pathPct > 0) {
    const fillW = (barW * Math.min(100, pathPct)) / 100
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    barGrad.addColorStop(0, '#3380ff')
    barGrad.addColorStop(1, '#5eead4')
    ctx.fillStyle = barGrad
    roundRect(ctx, barX, plan.barY, fillW, plan.barH, 12)
    ctx.fill()
  }

  ctx.fillStyle = '#71717a'
  ctx.font = '22px system-ui, sans-serif'
  ctx.fillText('dthelper.kayooliveira.com', ix, plan.footerLine1Y)
  ctx.fillStyle = '#52525b'
  ctx.font = '20px system-ui, sans-serif'
  const footer2 = isPt
    ? 'Fan-made · não afiliado à Epic Games'
    : 'Fan-made · not affiliated with Epic Games'
  ctx.fillText(footer2, ix, plan.footerLine2Y)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export PNG'))
    }, 'image/png')
  })
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
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
