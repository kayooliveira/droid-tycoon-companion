import { test, expect } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

async function seedProgress(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key }) => {
      localStorage.clear()
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 2,
            onboardingComplete: true,
            progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
            inventory: [],
            settings: {
              locale: 'pt-BR',
              localeSource: 'user',
              theme: 'dark',
              trackInventory: true,
              animationsEnabled: false,
              disputedPreference: {},
              installBannerDismissed: true,
              iosInstallHintDismissed: true,
            },
            lastSavedAt: new Date().toISOString(),
          },
          version: 0,
        }),
      )
    },
    { key: STORE_KEY },
  )
  await page.goto('/progress')
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
  await expect(page.getByTestId('progress-unified-group')).toBeVisible()
}

test.describe('Progresso inventory toasts and sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedProgress(page)
  })

  test('plus adds droid and shows toast without opening detail sheet', async ({ page }) => {
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('droid-detail-sheet')).toHaveCount(0)
    await expect(page.getByTestId('toast-title')).toContainText('adicionado')
    await expect(page.getByTestId('toast-detail')).toContainText('Renascimento #13')
  })

  test('tapping droid row opens detail sheet', async ({ page }) => {
    await page.getByTestId('progress-droid-row-open').first().click()
    await expect(page.getByTestId('droid-detail-sheet')).toBeVisible({ timeout: 5000 })
  })

  test('toast auto-dismisses after about 4 seconds', async ({ page }) => {
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('toast-item')).toHaveCount(0, { timeout: 6000 })
  })

  test('toast capsule styling — blur and single-line title', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'backdrop-filter assertion targets Chromium')
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible()
    const styles = await page.getByTestId('toast-item').evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        backdropFilter: cs.backdropFilter,
        webkitBackdropFilter: cs.getPropertyValue('-webkit-backdrop-filter'),
        borderRadius: cs.borderRadius,
      }
    })
    expect(styles.backdropFilter).not.toBe('none')
    expect(styles.webkitBackdropFilter).not.toBe('none')

    const titleMetrics = await page.getByTestId('toast-title').evaluate((el) => {
      const cs = getComputedStyle(el)
      const lh = parseFloat(cs.lineHeight)
      const h = el.getBoundingClientRect().height
      return { h, lh }
    })
    expect(Math.abs(titleMetrics.h - titleMetrics.lh)).toBeLessThan(1.5)
  })

  test('sheet open: toast on top and close stays tappable', async ({ page }) => {
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible()
    await page.getByTestId('progress-droid-row-open').first().click()
    await expect(page.getByTestId('droid-detail-sheet')).toBeVisible()

    const toastOnTop = await page.evaluate(() => {
      const toast = document.querySelector('[data-testid="toast-item"]')
      if (!toast) return false
      const r = toast.getBoundingClientRect()
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return Boolean(el?.closest('[data-testid="toast-item"]'))
    })
    expect(toastOnTop).toBe(true)

    const close = page.getByTestId('droid-detail-sheet-close')
    await expect(close).toBeVisible()
    const closeHit = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="droid-detail-sheet-close"]')
      if (!btn) return null
      const r = btn.getBoundingClientRect()
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return el?.closest('[data-testid]')?.getAttribute('data-testid') ?? el?.tagName ?? null
    })
    expect(closeHit).toBe('droid-detail-sheet-close')
    await close.click()
    await expect(page.getByTestId('droid-detail-sheet')).toHaveCount(0, { timeout: 8000 })
  })
})
