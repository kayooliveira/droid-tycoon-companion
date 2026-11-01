import { describe, expect, it } from 'vitest'

describe('exportCycle PDF (react-pdf)', () => {
  it('lazy export module exposes guide/progress helpers', async () => {
    const mod = await import('./exportCycle')
    expect(typeof mod.exportCycleGuidePdf).toBe('function')
    expect(typeof mod.exportCycleProgressPdf).toBe('function')
  })
})
