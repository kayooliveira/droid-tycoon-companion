import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/progress-x'
const STORE_KEY = 'droid-tycoon-companion-store'
const VIEWPORT = { width: 390, height: 844 }

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

function progressState(theme: 'dark' | 'light', inventory: unknown[]) {
  return {
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
  }
}

async function waitForProgress(page: Page) {
  await page.goto('/progress', { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
  await expect(page.getByTestId('requirement-inventory-actions').first()).toBeVisible({
    timeout: 25_000,
  })
}

async function settleToast(page: Page) {
  await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(450)
}

test.describe('progress x controls artifacts', () => {
  test.use({ viewport: VIEWPORT })

  test('dark: met x and unmet plus on rebirth 8', async ({ page }) => {
    await seedStore(
      page,
      progressState('dark', [
        { id: 'u-util', droidId: 'util-tec-ulti-tech', tier: 'gold', quantity: 1 },
      ]),
    )
    await waitForProgress(page)
    await expect(page.getByTestId('requirement-inventory-remove').first()).toBeVisible()
    await expect(page.getByTestId('requirement-inventory-add').first()).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-progress-x-plus.png') })
  })

  test('light: met x and unmet plus', async ({ page }) => {
    await seedStore(
      page,
      progressState('light', [
        { id: 'u-util', droidId: 'util-tec-ulti-tech', tier: 'gold', quantity: 1 },
      ]),
    )
    await waitForProgress(page)
    await expect(page.getByTestId('requirement-inventory-remove').first()).toBeVisible()
    await expect(page.getByTestId('requirement-inventory-add').first()).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'light-progress-x-plus.png') })
  })

  test('dark: toast after remove', async ({ page }) => {
    await seedStore(
      page,
      progressState('dark', [
        { id: 'u-util', droidId: 'util-tec-ulti-tech', tier: 'gold', quantity: 1 },
      ]),
    )
    await waitForProgress(page)
    const utilRow = page
      .getByTestId('requirement-card')
      .filter({ hasText: 'Util-Tec (Ulti-Tech)' })
    await utilRow.getByTestId('requirement-inventory-remove').click()
    await settleToast(page)
    await expect(page.getByText(/Util-Tec.*Ouro removido/i)).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-toast-after-remove.png') })
  })
})
