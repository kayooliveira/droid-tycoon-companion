export const SHARE_CARD_SIZE = 1080
export const CARD_BORDER = 48
export const CARD_INNER_PAD = 56
export const SECTION_GAP = 32

export interface ShareCardLayoutPlan {
  cardInnerTop: number
  cardInnerBottom: number
  cardInnerLeft: number
  cardInnerWidth: number
  maxBaselineY: number
  footerLine1Y: number
  footerLine2Y: number
  barY: number
  barH: number
  statsY: number
  statsH: number
  droidsY: number
  droidsH: number
  droidTileW: number
  droidColGap: number
}

export function planShareCardLayout(): ShareCardLayoutPlan {
  const cardInnerTop = CARD_BORDER + CARD_INNER_PAD
  const cardInnerBottom = SHARE_CARD_SIZE - CARD_BORDER - CARD_INNER_PAD
  const cardInnerLeft = CARD_BORDER + CARD_INNER_PAD
  const cardInnerWidth = SHARE_CARD_SIZE - 2 * (CARD_BORDER + CARD_INNER_PAD)

  const headerH = 128
  const nextTitleH = 40
  const statsH = 136
  const barH = 28
  const footerBlockH = 52

  let y = cardInnerTop + headerH + SECTION_GAP + nextTitleH + SECTION_GAP

  const reservedBelowDroids =
    SECTION_GAP + statsH + SECTION_GAP + barH + SECTION_GAP + footerBlockH
  const droidsH = Math.max(220, cardInnerBottom - y - reservedBelowDroids)
  const droidsY = y
  y += droidsH + SECTION_GAP

  const statsY = y
  y += statsH + SECTION_GAP
  const barY = y

  const footerLine2Y = cardInnerBottom - 8
  const footerLine1Y = cardInnerBottom - 36
  const maxBaselineY = footerLine2Y

  const droidColGap = 20
  const droidTileW = (cardInnerWidth - 2 * droidColGap) / 3

  return {
    cardInnerTop,
    cardInnerBottom,
    cardInnerLeft,
    cardInnerWidth,
    maxBaselineY,
    footerLine1Y,
    footerLine2Y,
    barY,
    barH,
    statsY,
    statsH,
    droidsY,
    droidsH,
    droidTileW,
    droidColGap,
  }
}

export function assertShareCardLayoutInBounds(plan: ShareCardLayoutPlan): void {
  if (plan.barY + plan.barH > plan.footerLine1Y - SECTION_GAP) {
    throw new Error('Progress bar overlaps footer region')
  }
  if (plan.statsY + plan.statsH > plan.barY - SECTION_GAP) {
    throw new Error('Stats overlap bar')
  }
  if (plan.droidsY + plan.droidsH > plan.statsY - SECTION_GAP) {
    throw new Error('Droids overlap stats')
  }
  if (plan.maxBaselineY > plan.cardInnerBottom) {
    throw new Error('Footer baseline outside card inner bounds')
  }
  if (plan.footerLine2Y > plan.cardInnerBottom) {
    throw new Error('Footer line 2 outside card')
  }
}
