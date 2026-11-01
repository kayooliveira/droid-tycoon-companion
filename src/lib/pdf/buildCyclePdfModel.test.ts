import { describe, expect, it } from 'vitest'
import { buildCyclePdfModel } from './buildCyclePdfModel'

describe('buildCyclePdfModel guide sell', () => {
  it('includes sell lines per rebirth from rebirthSellPlan', () => {
    const model = buildCyclePdfModel({
      pathId: 'path-1',
      locale: 'pt-BR',
      mode: 'guide',
      nextRebirth: 1,
      completedOnPath: 0,
      inventory: [],
    })
    expect(model).not.toBeNull()
    const withSell = model!.rebirths.filter((r) => r.sellLines.length > 0)
    expect(withSell.length).toBeGreaterThan(0)
    expect(model!.guideSellSummary!.length).toBe(withSell.length)
    const first = withSell[0]!
    expect(first.sellLines[0]!.label.length).toBeGreaterThan(0)
  })
})
