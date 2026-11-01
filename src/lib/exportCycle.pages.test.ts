import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildCyclePdfCanvases } from './exportCycle'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts'

function canvasSupported(): boolean {
  const c = document.createElement('canvas')
  return Boolean(c.getContext('2d'))
}

describe('exportCycle PDF page renders', () => {
  it(
    'writes sample guide and progress PNG pages when UX_ARTIFACTS_DIR is set',
    async () => {
    if (!process.env.UX_ARTIFACTS_DIR || !canvasSupported()) return

    fs.mkdirSync(ARTIFACTS, { recursive: true })

    const guidePages = await buildCyclePdfCanvases({
      pathId: 'path-1',
      locale: 'pt-BR',
      mode: 'guide',
      nextRebirth: 1,
      completedOnPath: 0,
      inventory: [],
    })
    expect(guidePages.length).toBeGreaterThan(2)
    guidePages.forEach((canvas, i) => {
      const data = canvas.toDataURL('image/png').split(',')[1]
      fs.writeFileSync(
        path.join(ARTIFACTS, `pdf-ciclo-guia-pt-${i + 1}.png`),
        Buffer.from(data!, 'base64'),
      )
    })

    const progressPages = await buildCyclePdfCanvases({
      pathId: 'path-1',
      locale: 'pt-BR',
      mode: 'progress',
      nextRebirth: 5,
      completedOnPath: 4,
      inventory: [],
    })
    expect(progressPages.length).toBeGreaterThan(2)
    progressPages.slice(0, 5).forEach((canvas, i) => {
      const data = canvas.toDataURL('image/png').split(',')[1]
      fs.writeFileSync(
        path.join(ARTIFACTS, `pdf-progresso-pt-${i + 1}.png`),
        Buffer.from(data!, 'base64'),
      )
    })
  },
  60_000,
  )
})
