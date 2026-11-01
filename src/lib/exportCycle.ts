import type { InventoryUnit } from '../domain/types'

export type ExportCycleMode = 'guide' | 'progress'

export interface ExportCycleInput {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory: InventoryUnit[]
  locale: 'en' | 'pt-BR'
  mode?: ExportCycleMode
}

export async function exportCyclePdf(input: ExportCycleInput): Promise<Blob> {
  const { renderCyclePdfBlob } = await import('./pdf/renderCyclePdf')
  return renderCyclePdfBlob(input)
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

/** Progress PDF pages rasterized to PNG (lazy pdf.js). */
export async function exportCyclePngChunks(input: ExportCycleInput): Promise<Blob[]> {
  const pdfBlob = await exportCycleProgressPdf(input)
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const data = await pdfBlob.arrayBuffer()
  const doc = await pdfjs.getDocument({ data }).promise
  const blobs: Blob[] = []

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    await page.render({ canvasContext: ctx, viewport }).promise
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png')
    })
    blobs.push(blob)
  }

  return blobs
}
