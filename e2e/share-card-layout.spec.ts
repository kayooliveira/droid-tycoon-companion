import { test, expect } from '@playwright/test'
import {
  assertShareCardLayoutInBounds,
  CARD_BORDER,
  CARD_INNER_PAD,
  planShareCardLayout,
  SHARE_CARD_SIZE,
} from '../src/lib/shareProgressCardLayout'

test('share card layout fits inside inner card padding', () => {
  const plan = planShareCardLayout()
  expect(() => assertShareCardLayoutInBounds(plan)).not.toThrow()
  const innerBottom = SHARE_CARD_SIZE - CARD_BORDER - CARD_INNER_PAD
  expect(plan.footerLine2Y).toBeLessThanOrEqual(innerBottom)
  expect(plan.barY + plan.barH).toBeLessThanOrEqual(plan.footerLine1Y - 32)
})
