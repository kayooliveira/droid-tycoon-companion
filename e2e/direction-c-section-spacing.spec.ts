import { test, expect } from '@playwright/test'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const TOLERANCE = 1

async function verticalGap(
  page: import('@playwright/test').Page,
  bottomSelector: string,
  topSelector: string,
) {
  return page.evaluate(
    ({ bottomSelector, topSelector }) => {
      const bottomEl = document.querySelector(bottomSelector)
      const topEl = document.querySelector(topSelector)
      if (!bottomEl || !topEl) return null
      const b = bottomEl.getBoundingClientRect()
      const t = topEl.getBoundingClientRect()
      return t.top - b.bottom
    },
    { bottomSelector, topSelector },
  )
}

async function seed(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState('dark') },
  )
  await page.reload()
}

test.describe('Direction C section spacing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
    await page.setViewportSize({ width: 390, height: 844 })
    await seed(page)
  })

  test('Progresso — block, section lead, header-to-group, card list', async ({ page }) => {
    await page.goto('/progress')
    await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })

    const summaryToSearch = await verticalGap(
      page,
      '[data-testid="progress-summary"]',
      '[data-testid="progress-droid-search"]',
    )
    expect(summaryToSearch).not.toBeNull()
    expect(summaryToSearch!).toBeGreaterThanOrEqual(16 - TOLERANCE)
    expect(summaryToSearch!).toBeLessThanOrEqual(16 + TOLERANCE)

    const actionsToRebirthHeader = await verticalGap(
      page,
      '[data-testid="progress-actions"]',
      '[data-testid="progress-rebirth-list"] .dc-section-header',
    )
    expect(actionsToRebirthHeader).not.toBeNull()
    expect(actionsToRebirthHeader!).toBeGreaterThanOrEqual(24 - TOLERANCE)
    expect(actionsToRebirthHeader!).toBeLessThanOrEqual(24 + TOLERANCE)

    const rebirthHeaderToFirstCard = await verticalGap(
      page,
      '[data-testid="progress-rebirth-list"] .dc-section-header-row',
      '[data-testid="progress-list-item-1"]',
    )
    expect(rebirthHeaderToFirstCard).not.toBeNull()
    expect(rebirthHeaderToFirstCard!).toBeGreaterThanOrEqual(8 - TOLERANCE)
    expect(rebirthHeaderToFirstCard!).toBeLessThanOrEqual(8 + TOLERANCE)

    const cardOneToTwo = await verticalGap(
      page,
      '[data-testid="progress-list-item-1"]',
      '[data-testid="progress-list-item-2"]',
    )
    expect(cardOneToTwo).not.toBeNull()
    expect(cardOneToTwo!).toBeGreaterThanOrEqual(8 - TOLERANCE)
    expect(cardOneToTwo!).toBeLessThanOrEqual(8 + TOLERANCE)
  })

  test('Vender — section lead and header-to-group', async ({ page }) => {
    await page.goto('/sell')
    await expect(page.getByTestId('sell-page')).toBeVisible({ timeout: 25_000 })

    const introToHeader = await verticalGap(
      page,
      '[data-testid="sell-page"] .inset-group:first-of-type',
      '[data-testid="sell-center-safe-now"] .dc-section-header',
    )
    expect(introToHeader).not.toBeNull()
    expect(introToHeader!).toBeGreaterThanOrEqual(24 - TOLERANCE)
    expect(introToHeader!).toBeLessThanOrEqual(24 + TOLERANCE)

    const headerToGroup = await verticalGap(
      page,
      '[data-testid="sell-center-safe-now"] .dc-section-header',
      '[data-testid="sell-center-safe-now"] .inset-group',
    )
    expect(headerToGroup).not.toBeNull()
    expect(headerToGroup!).toBeGreaterThanOrEqual(8 - TOLERANCE)
    expect(headerToGroup!).toBeLessThanOrEqual(8 + TOLERANCE)
  })

  test('Mais (Config) — header-to-group and section lead', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 25_000 })

    const appearanceHeaderToGroup = await verticalGap(
      page,
      '[data-testid="settings-page"] .dc-section-header',
      '[data-testid="settings-page"] .inset-group',
    )
    expect(appearanceHeaderToGroup).not.toBeNull()
    expect(appearanceHeaderToGroup!).toBeGreaterThanOrEqual(8 - TOLERANCE)
    expect(appearanceHeaderToGroup!).toBeLessThanOrEqual(8 + TOLERANCE)

    const firstGroupToLanguageHeader = await verticalGap(
      page,
      '[data-testid="settings-page"] .inset-group',
      '[data-testid="settings-page"] .dc-section-header:nth-of-type(2)',
    )
    expect(firstGroupToLanguageHeader).not.toBeNull()
    expect(firstGroupToLanguageHeader!).toBeGreaterThanOrEqual(24 - TOLERANCE)
    expect(firstGroupToLanguageHeader!).toBeLessThanOrEqual(24 + TOLERANCE)
  })

  test('Fusão — section lead and recipe card gap', async ({ page }) => {
    await page.goto('/fusion')
    await expect(page.getByTestId('fusion-page')).toBeVisible({ timeout: 25_000 })

    const rulesToHelpsHeader = await verticalGap(
      page,
      '[data-testid="fusion-rules-card"]',
      '[data-testid="fusion-page"] section:nth-of-type(2) .dc-section-header',
    )
    expect(rulesToHelpsHeader).not.toBeNull()
    expect(rulesToHelpsHeader!).toBeGreaterThanOrEqual(24 - TOLERANCE)
    expect(rulesToHelpsHeader!).toBeLessThanOrEqual(24 + TOLERANCE)

    const helpsHeaderToCard = await verticalGap(
      page,
      '[data-testid="fusion-page"] section:nth-of-type(2) .dc-section-header',
      '[data-testid="fusion-page"] section:nth-of-type(2) .inset-group',
    )
    expect(helpsHeaderToCard).not.toBeNull()
    expect(helpsHeaderToCard!).toBeGreaterThanOrEqual(8 - TOLERANCE)
    expect(helpsHeaderToCard!).toBeLessThanOrEqual(8 + TOLERANCE)
  })

  test('Ciclos — block gap and card list', async ({ page }) => {
    await page.goto('/cycles')
    await expect(page.getByTestId('cycles-page')).toBeVisible({ timeout: 25_000 })

    const pathBlockToFirstRebirth = await verticalGap(
      page,
      '[data-testid="cycles-page"] .dc-screen-stack > .inset-group',
      '[data-testid="cycles-rebirth-group-1"]',
    )
    expect(pathBlockToFirstRebirth).not.toBeNull()
    expect(pathBlockToFirstRebirth!).toBeGreaterThanOrEqual(16 - TOLERANCE)
    expect(pathBlockToFirstRebirth!).toBeLessThanOrEqual(16 + TOLERANCE)

    const rebirthOneToTwo = await verticalGap(
      page,
      '[data-testid="cycles-rebirth-group-1"]',
      '[data-testid="cycles-rebirth-group-2"]',
    )
    expect(rebirthOneToTwo).not.toBeNull()
    expect(rebirthOneToTwo!).toBeGreaterThanOrEqual(8 - TOLERANCE)
    expect(rebirthOneToTwo!).toBeLessThanOrEqual(8 + TOLERANCE)

    const lastRebirthToSuperHeader = await verticalGap(
      page,
      '[data-testid="cycles-page"] .dc-card-list .inset-group:last-of-type',
      '[data-testid="cycles-super-section-header"]',
    )
    expect(lastRebirthToSuperHeader).not.toBeNull()
    expect(lastRebirthToSuperHeader!).toBeGreaterThanOrEqual(24 - TOLERANCE)
    expect(lastRebirthToSuperHeader!).toBeLessThanOrEqual(24 + TOLERANCE)
  })
})
