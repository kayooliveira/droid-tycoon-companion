import { describe, expect, it, vi } from 'vitest'
import { renderShareProgressCard } from './shareProgressCard'

describe('renderShareProgressCard', () => {
  it('exports a PNG blob', async () => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_: string) {
          queueMicrotask(() => this.onload?.())
        }
      },
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      arcTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      clip: () => {},
      save: () => {},
      restore: () => {},
      drawImage: () => {},
      fillText: () => {},
      measureText: () => ({ width: 40 }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
      cb(new Blob(['png'], { type: 'image/png' }))
    })
    const blob = await renderShareProgressCard({
      pathId: 'path-1',
      nextRebirth: 3,
      completedOnPath: 2,
      inventory: [{ id: '1', droidId: 'gonk', tier: 'default', quantity: 1 }],
      locale: 'en',
    })
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBeGreaterThan(0)
  })
})
