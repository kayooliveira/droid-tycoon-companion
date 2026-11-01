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
  const title = isPt ? 'Droid Tycoon Companion' : 'Droid Tycoon Companion'
  const line1 = isPt ? `Path: ${pathName}` : `Path: ${pathName}`
  const line2 = isPt
    ? `Rebirths: ${data.completedOnPath}/40 · Próximo #${Math.min(data.nextRebirth, 40)}`
    : `Rebirths: ${data.completedOnPath}/40 · Next #${Math.min(data.nextRebirth, 40)}`
  const line3 = isPt ? `Progresso do Path: ${Math.round(pathPct)}%` : `Path progress: ${Math.round(pathPct)}%`
  const line4 = isPt ? `Droiddex no inventário: ${dexPct}%` : `Droiddex in inventory: ${dexPct}%`
  const footer = 'dthelper.kayooliveira.com'

  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#070b12')
  grad.addColorStop(1, '#111827')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  roundRect(ctx, 48, 48, width - 96, height - 96, 32)
  ctx.stroke()

  ctx.fillStyle = '#59a3ff'
  ctx.font = '600 28px system-ui, sans-serif'
  ctx.fillText('DROID TYCOON', 96, 140)

  ctx.fillStyle = '#f4f4f5'
  ctx.font = '700 52px system-ui, sans-serif'
  ctx.fillText(title, 96, 210)

  ctx.fillStyle = '#a1a1aa'
  ctx.font = '32px system-ui, sans-serif'
  ctx.fillText(line1, 96, 320)
  ctx.fillText(line2, 96, 380)
  ctx.fillText(line3, 96, 440)
  ctx.fillText(line4, 96, 500)

  ctx.fillStyle = '#5eead4'
  ctx.font = '600 36px system-ui, sans-serif'
  ctx.fillText(`${Math.round(pathPct)}%`, 96, 620)

  ctx.fillStyle = '#71717a'
  ctx.font = '24px system-ui, sans-serif'
  ctx.fillText(footer, 96, height - 96)

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
