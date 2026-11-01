import { cycleById, droidById, getRebirth } from '../domain/gameData'
import { pathProgressPercent } from '../domain/progress'
import type { InventoryUnit } from '../domain/types'
import { droidImageSrc } from './images'

export interface ShareCardInput {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory: InventoryUnit[]
  locale: 'en' | 'pt-BR'
}

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
  const width = 1080
  const height = 1080
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const isPt = data.locale === 'pt-BR'
  const pathName = cycleById.get(data.pathId)?.name ?? data.pathId
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

  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  roundRect(ctx, 48, 48, width - 96, height - 96, 32)
  ctx.fill()
  ctx.strokeStyle = 'rgba(89,163,255,0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  const logoSize = 152
  const logo = await loadImage('/pwa-512.png')
  if (logo) {
    ctx.save()
    roundRect(ctx, 72, 72, logoSize, logoSize, 28)
    ctx.clip()
    drawCoverImage(ctx, logo, 72, 72, logoSize)
    ctx.restore()
  }

  ctx.fillStyle = '#59a3ff'
  ctx.font = '700 32px system-ui, sans-serif'
  ctx.fillText('DROID TYCOON', 72 + logoSize + 28, 120)
  ctx.fillStyle = '#fafafa'
  ctx.font = '600 40px system-ui, sans-serif'
  ctx.fillText('Companion', 72 + logoSize + 28, 168)
  ctx.fillStyle = '#a1a1aa'
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillText(`${isPt ? 'Path' : 'Path'} · ${pathName}`, 72 + logoSize + 28, 210)

  const nextLabel = isPt
    ? `Próximo rebirth #${Math.min(data.nextRebirth, 40)}`
    : `Next rebirth #${Math.min(data.nextRebirth, 40)}`
  ctx.fillStyle = '#e4e4e7'
  ctx.font = '600 34px system-ui, sans-serif'
  ctx.fillText(nextLabel, 72, 280)

  const tileY = 330
  const tileSize = 200
  const gap = 36
  const tilesX = 72
  const droidImgs = await Promise.all(
    reqDroids.slice(0, 3).map(async (d) => {
      if (!d) return null
      return loadImage(droidImageSrc(d.id, d.imageLocal))
    }),
  )

  for (let i = 0; i < 3; i++) {
    const x = tilesX + i * (tileSize + gap)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    roundRect(ctx, x, tileY, tileSize, tileSize + 56, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    const img = droidImgs[i]
    const d = reqDroids[i]
    if (img && d) {
      ctx.save()
      roundRect(ctx, x + 12, tileY + 12, tileSize - 24, tileSize - 24, 16)
      ctx.clip()
      drawCoverImage(ctx, img, x + 12, tileY + 12, tileSize - 24)
      ctx.restore()
      ctx.fillStyle = '#d4d4d8'
      ctx.font = '22px system-ui, sans-serif'
      const name = d.name.length > 14 ? `${d.name.slice(0, 13)}…` : d.name
      ctx.fillText(name, x + 16, tileY + tileSize + 36)
    } else {
      ctx.fillStyle = '#52525b'
      ctx.font = '24px system-ui, sans-serif'
      ctx.fillText('—', x + tileSize / 2 - 8, tileY + tileSize / 2)
    }
  }

  const statY = 620
  const statW = (width - 144) / 3
  const stats = [
    {
      value: `${data.completedOnPath}`,
      sub: isPt ? 'rebirths ok' : 'rebirths done',
      suffix: '/40',
    },
    { value: `${Math.round(pathPct)}%`, sub: isPt ? 'do Path' : 'path' },
    { value: `${invCount}`, sub: isPt ? 'droids no inv.' : 'droids tracked' },
  ]

  stats.forEach((s, i) => {
    const x = 72 + i * statW
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, x, statY, statW - 16, 140, 16)
    ctx.fill()
    ctx.fillStyle = '#5eead4'
    ctx.font = '700 64px system-ui, sans-serif'
    ctx.fillText(s.value, x + 20, statY + 72)
    if (s.suffix) {
      ctx.fillStyle = '#71717a'
      ctx.font = '32px system-ui, sans-serif'
      ctx.fillText(s.suffix, x + 20 + ctx.measureText(s.value).width + 4, statY + 72)
    }
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '24px system-ui, sans-serif'
    ctx.fillText(s.sub, x + 20, statY + 110)
  })

  const barX = 72
  const barY = 790
  const barW = width - 144
  const barH = 24
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, barX, barY, barW, barH, 12)
  ctx.fill()
  if (pathPct > 0) {
    const fillW = (barW * Math.min(100, pathPct)) / 100
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    barGrad.addColorStop(0, '#3380ff')
    barGrad.addColorStop(1, '#5eead4')
    ctx.fillStyle = barGrad
    roundRect(ctx, barX, barY, fillW, barH, 12)
    ctx.fill()
  }

  ctx.fillStyle = '#71717a'
  ctx.font = '22px system-ui, sans-serif'
  const footer1 = 'dthelper.kayooliveira.com'
  ctx.fillText(footer1, 72, height - 120)
  ctx.fillStyle = '#52525b'
  ctx.font = '20px system-ui, sans-serif'
  const footer2 = isPt
    ? 'Fan-made · não afiliado à Epic Games'
    : 'Fan-made · not affiliated with Epic Games'
  ctx.fillText(footer2, 72, height - 88)

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
