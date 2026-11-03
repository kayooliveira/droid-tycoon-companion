import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/progress-minus'
const STORE_KEY = 'droid-tycoon-companion-store'

async function seedStore(page: Page, state: Record<string, unknown>) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state: s }) => {
      localStorage.setItem(key, JSON.stringify({ state: s, version: 0 }))
    },
    { key: STORE_KEY, state },
  )
  await page.reload()
}

async function seedOnboarded(page: Page, theme: 'dark' | 'light', inventory: unknown[] = []) {
  await seedStore(page, {
    schemaVersion: 2,
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 8, completedOnPath: 7 },
    inventory,
    settings: {
      locale: 'pt-BR',
      localeSource: 'user',
      theme,
      trackInventory: true,
      animationsEnabled: false,
      disputedPreference: {},
      installBannerDismissed: true,
      iosInstallHintDismissed: true,
    },
    lastSavedAt: new Date().toISOString(),
  })
}

async function openProgressFocus(page: Page) {
  await page.goto('/progress', { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
}

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
})

test.describe('progress minus artifacts', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  test('stepper and undo toast viewport shots', async ({ page }) => {
    await seedOnboarded(page, 'dark')
    await openProgressFocus(page)
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('requirement-inventory-actions').first()).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-stepper.png'), fullPage: false })

    await expect(page.getByTestId('toast-item')).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-undo-toast.png'), fullPage: false })

    await seedOnboarded(page, 'light', [
      { id: 'u1', droidId: 'hov-r', tier: 'diamond', quantity: 1 },
    ])
    await openProgressFocus(page)
    await expect(page.getByTestId('requirement-inventory-remove').first()).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-light-stepper.png'), fullPage: false })
  })
})
