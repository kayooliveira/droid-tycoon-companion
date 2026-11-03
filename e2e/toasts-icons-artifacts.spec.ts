import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/toasts-icons'
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

async function seedOnboarded(page: Page, theme: 'dark' | 'light') {
  await seedStore(page, {
    schemaVersion: 2,
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
    inventory: [],
    settings: {
      locale: 'pt-BR',
      localeSource: 'user',
      theme,
      trackInventory: false,
      animationsEnabled: false,
      disputedPreference: {},
      installBannerDismissed: true,
      iosInstallHintDismissed: true,
    },
    lastSavedAt: new Date().toISOString(),
  })
}

test.describe('toasts and outline icons artifacts', () => {
  test.use({ viewport: VIEWPORT })

  test('dark: progress screens and toasts', async ({ page }) => {
    await seedOnboarded(page, 'dark')
    await page.goto('/progress', { waitUntil: 'domcontentloaded' })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'dark-progress-outline-nav.png'),
    })

    await page.getByRole('button', { name: 'Concluir' }).click()
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 5000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'dark-toast-rebirth-success-undo.png'),
    })

    await page.getByTestId('toast-action').click()
    await expect(page.getByText(/Renascimento #1 desfeito/i)).toBeVisible({ timeout: 5000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'dark-toast-rebirth-undone.png'),
    })

    await page.goto('/inventory', { waitUntil: 'domcontentloaded' })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'dark-inventory-outline-nav.png'),
    })

    await page.evaluate(() => {
      window.dispatchEvent(new Event('pwa-need-refresh'))
    })
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 5000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'dark-toast-info-update.png'),
    })
  })

  test('light: screens and import error toast', async ({ page }) => {
    await seedOnboarded(page, 'light')
    await page.goto('/progress', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 15_000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'light-progress-outline-nav.png'),
    })
    await page.goto('/inventory', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('mobile-floating-nav')).toBeVisible({ timeout: 15_000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'light-inventory-outline-nav.png'),
    })
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('settings-import-trigger').click()
    await page.evaluate(() => {
      const input = document.querySelector(
        'input[type="file"][accept="application/json"]',
      ) as HTMLInputElement
      const file = new File(['not-json'], 'bad.json', { type: 'application/json' })
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 5000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, 'light-toast-import-error.png'),
    })
  })
})
