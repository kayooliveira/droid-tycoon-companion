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
    await expect(page.getByTestId('toast-item')).toContainText('Renascimento #13')
  })

  test('tapping droid row opens detail sheet', async ({ page }) => {
    await page.getByTestId('progress-droid-row-open').first().click()
    await expect(page.getByTestId('droid-detail-sheet')).toBeVisible({ timeout: 5000 })
  })

  test('sheet close stays clickable when toast is visible', async ({ page }) => {
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible()
    await page.getByTestId('progress-droid-row-open').first().click()
    await expect(page.getByTestId('droid-detail-sheet')).toBeVisible()
    await page.getByTestId('droid-detail-sheet-close').click()
    await expect(page.getByTestId('droid-detail-sheet')).toHaveCount(0, { timeout: 8000 })
  })
})
