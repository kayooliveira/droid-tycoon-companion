import { test, expect } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

async function seedOnboarded(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        state: {
          schemaVersion: 2,
          onboardingComplete: true,
          progress: { pathId: 'path-1', nextRebirth: 3, completedOnPath: 2 },
          inventory: [],
          settings: {
            locale: 'en',
            localeSource: 'user',
            theme: 'dark',
            trackInventory: true,
            animationsEnabled: true,
            disputedPreference: {},
            installBannerDismissed: true,
            iosInstallHintDismissed: true,
          },
          lastSavedAt: new Date().toISOString(),
        },
        version: 0,
      }),
    )
  }, STORE_KEY)
  await page.reload()
}

test.describe('iOS input zoom guard', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
  })

  test('viewport meta prevents focus zoom scale', async ({ page }) => {
    await page.goto('/')
    const content = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(content).toContain('maximum-scale=1')
    expect(content).toContain('width=device-width')
    expect(content).toContain('viewport-fit=cover')
  })

  test('form controls use at least 16px font on mobile width', async ({ page }) => {
    await seedOnboarded(page)
    await page.goto('/inventory')
    await page.waitForTimeout(300)

    const selectors = [
      'input[placeholder]',
      'select',
    ] as const

    for (const sel of selectors) {
      const el = page.locator(sel).first()
      await expect(el).toBeVisible()
      const px = await el.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
      expect(px, `${sel} font-size`).toBeGreaterThanOrEqual(16)
    }

    await page.goto('/cycles')
    await page.waitForTimeout(200)
    const cycleSelect = page.getByTestId('cycles-chip-path-1')
    await expect(cycleSelect).toBeVisible()
    const cyclePx = await cycleSelect.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    expect(cyclePx).toBeGreaterThanOrEqual(16)
  })
})
