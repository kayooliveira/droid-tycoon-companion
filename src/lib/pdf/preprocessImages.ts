import type { CyclePdfModel, PdfDroidReq } from './buildCyclePdfModel'

const imageCache = new Map<string, string>()

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
    reqs.map(async (req) => ({
      ...req,
      imageSrc: await resolvePdfImage(req.imageSrc),
    })),
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
