import { cycleById, gameData } from '../domain/gameData'
import { pathProgressPercent } from '../domain/progress'
import type { InventoryUnit } from '../domain/types'

export interface ShareCardInput {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory: InventoryUnit[]
  locale: 'en' | 'pt-BR'
}

function droiddexCollectionPercent(inventory: InventoryUnit[]): number {
  const unique = new Set(inventory.map((u) => u.droidId)).size
  return Math.round((unique / gameData.droids.length) * 100)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

export async function renderShareProgressCard(data: ShareCardInput): Promise<Blob> {
  const width = 1080
  const height = 1080
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const pathName = cycleById.get(data.pathId)?.name ?? data.pathId
  const pathPct = pathProgressPercent({
    pathId: data.pathId,
    nextRebirth: data.nextRebirth,
    completedOnPath: data.completedOnPath,
  })
  const dexPct = droiddexCollectionPercent(data.inventory)
  const isPt = data.locale === 'pt-BR'

  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#070b12')
  grad.addColorStop(0.55, '#0c121c')
  grad.addColorStop(1, '#111827')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  roundRect(ctx, 56, 56, width - 112, height - 112, 36)
  ctx.fill()
  ctx.strokeStyle = 'rgba(89,163,255,0.35)'
  ctx.lineWidth = 3
  ctx.stroke()

  try {
    const icon = await loadImage('/pwa-192.png')
    ctx.save()
    roundRect(ctx, 88, 88, 96, 96, 22)
    ctx.clip()
    ctx.drawImage(icon, 88, 88, 96, 96)
    ctx.restore()
  } catch {
    /* icon optional */
  }

  ctx.fillStyle = '#59a3ff'
  ctx.font = '600 26px system-ui, sans-serif'
  ctx.fillText('DROID TYCOON', 208, 130)
  ctx.fillStyle = '#71717a'
  ctx.font = '22px system-ui, sans-serif'
  ctx.fillText(isPt ? 'Companion · fan tool' : 'Companion · fan tool', 208, 168)

  ctx.fillStyle = '#fafafa'
  ctx.font = '700 48px system-ui, sans-serif'
  ctx.fillText(isPt ? 'Meu progresso' : 'My progress', 88, 260)

  ctx.fillStyle = '#d4d4d8'
  ctx.font = '34px system-ui, sans-serif'
  ctx.fillText(`${isPt ? 'Path' : 'Path'}: ${pathName}`, 88, 340)
  ctx.fillText(
    isPt
      ? `Rebirths: ${data.completedOnPath}/40 · próximo #${Math.min(data.nextRebirth, 40)}`
      : `Rebirths: ${data.completedOnPath}/40 · next #${Math.min(data.nextRebirth, 40)}`,
    88,
    400,
  )
  ctx.fillText(
    isPt ? `Droiddex no inventário: ${dexPct}%` : `Droiddex in inventory: ${dexPct}%`,
    88,
    460,
  )

  const barX = 88
  const barY = 520
  const barW = width - 176
  const barH = 28
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  roundRect(ctx, barX, barY, barW, barH, 14)
  ctx.fill()
  const fillW = Math.max(8, (barW * pathPct) / 100)
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
  barGrad.addColorStop(0, '#3380ff')
  barGrad.addColorStop(1, '#5eead4')
  ctx.fillStyle = barGrad
  roundRect(ctx, barX, barY, fillW, barH, 14)
  ctx.fill()

  ctx.fillStyle = '#5eead4'
  ctx.font = '700 72px system-ui, sans-serif'
  ctx.fillText(`${Math.round(pathPct)}%`, 88, 660)
  ctx.fillStyle = '#a1a1aa'
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillText(isPt ? 'progresso do Path' : 'path progress', 88, 710)

  ctx.fillStyle = '#52525b'
  ctx.font = '24px system-ui, sans-serif'
  ctx.fillText('dthelper.kayooliveira.com', 88, height - 88)

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
