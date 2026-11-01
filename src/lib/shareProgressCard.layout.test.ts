import { describe, expect, it } from 'vitest'
import {
  assertShareCardLayoutInBounds,
  CARD_BORDER,
  CARD_INNER_PAD,
  planShareCardLayout,
  SHARE_CARD_SIZE,
} from './shareProgressCardLayout'

describe('planShareCardLayout', () => {
  it('keeps footer and bar inside card inner bounds for all states', () => {
    const plan = planShareCardLayout()
    expect(() => assertShareCardLayoutInBounds(plan)).not.toThrow()

    const innerBottom = SHARE_CARD_SIZE - CARD_BORDER - CARD_INNER_PAD
    expect(plan.footerLine2Y).toBeLessThanOrEqual(innerBottom)
    expect(plan.footerLine1Y).toBeLessThan(plan.footerLine2Y)
    expect(plan.barY + plan.barH).toBeLessThanOrEqual(plan.footerLine1Y - 32)
    expect(plan.maxBaselineY).toBeLessThanOrEqual(innerBottom)
  })

  it('allocates droid row height to fill vertical space', () => {
    const plan = planShareCardLayout()
    expect(plan.droidsH).toBeGreaterThanOrEqual(220)
    expect(plan.droidTileW * 3 + plan.droidColGap * 2).toBeLessThanOrEqual(plan.cardInnerWidth + 1)
    expect(plan.droidTileW).toBeGreaterThan(240)
  })
})
