import type { CyclePdfModel, PdfDroidReq } from './buildCyclePdfModel'

const imageCache = new Map<string, string>()

function initialsFor(name: string, id: string): string {
  const fromName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2)
  if (fromName.length >= 2) return fromName.toUpperCase()
  return id.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?'
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function missingDroidPlaceholderDataUrl(name: string, id: string, size = 64): string {
  const cacheKey = `missing:${id}:${size}`
  const hit = imageCache.get(cacheKey)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const r = size * 0.22
  ctx.beginPath()
  roundRectPath(ctx, 0, 0, size, size, r)
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#1e293b')
  grad.addColorStop(0.45, '#0f4c5c')
  grad.addColorStop(1, '#164e63')
  ctx.fillStyle = grad
  ctx.fill()

  const highlight = ctx.createRadialGradient(
    size * 0.3,
    size * 0.25,
    0,
    size * 0.3,
    size * 0.25,
    size * 0.55,
  )
  highlight.addColorStop(0, 'rgba(255,255,255,0.35)')
  highlight.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.save()
  ctx.beginPath()
  roundRectPath(ctx, 0, 0, size, size, r)
  ctx.clip()
  ctx.fillStyle = highlight
  ctx.fillRect(0, 0, size, size)
  ctx.restore()

  ctx.fillStyle = 'rgba(186, 230, 253, 0.92)'
  ctx.font = `700 ${Math.round(size * 0.34)}px Helvetica, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initialsFor(name, id), size / 2, size / 2 + 0.5)

  const out = canvas.toDataURL('image/png')
  imageCache.set(cacheKey, out)
  return out
}

async function webpToPngDataUrl(url: string): Promise<string> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Image load failed: ${url}`))
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || 32
  canvas.height = img.naturalHeight || 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return url
  ctx.drawImage(img, 0, 0)
  return canvas.toDataURL('image/png')
}

export async function resolvePdfImage(url: string): Promise<string> {
  const hit = imageCache.get(url)
  if (hit) return hit
  let out = url
  if (url.includes('.webp')) {
    try {
      out = await webpToPngDataUrl(url)
    } catch {
      out = url
    }
  }
  imageCache.set(url, out)
  return out
}

async function mapReqImages(reqs: PdfDroidReq[]): Promise<PdfDroidReq[]> {
  return Promise.all(
    reqs.map(async (req) => {
      if (req.imageMissing) {
        return {
          ...req,
          imageSrc: missingDroidPlaceholderDataUrl(req.name, req.droidId),
        }
      }
      return {
        ...req,
        imageSrc: await resolvePdfImage(req.imageSrc),
      }
    }),
  )
}

export async function preprocessPdfImages(model: CyclePdfModel): Promise<void> {
  model.rebirths = await Promise.all(
    model.rebirths.map(async (row) => ({
      ...row,
      requirements: await mapReqImages(row.requirements),
    })),
  )
}

export async function enrichCardRequirements<
  T extends { requirements: PdfDroidReq[] },
>(cards: T[]): Promise<T[]> {
  return Promise.all(
    cards.map(async (card) => ({
      ...card,
      requirements: await mapReqImages(card.requirements),
    })),
  )
}
