import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/toasts-icons-v2'
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

function onboardedState(theme: 'dark' | 'light') {
  return {
    schemaVersion: 2,
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
    inventory: [{ id: 'u1', droidId: 'a-lt', tier: 'default', quantity: 2 }],
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

async function waitForLoadedPage(page: Page, route: string, readyTestId: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId(readyTestId)).toBeVisible({ timeout: 25_000 })
}

async function settleToast(page: Page) {
  await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(450)
}

async function triggerImportFail(page: Page) {
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
  await settleToast(page)
}

async function completeRebirthWithToast(page: Page) {
  const complete = page.getByRole('button', { name: 'Concluir' })
  if (await complete.isEnabled()) {
    await complete.click()
  } else {
    await page.getByTestId('progress-more-trigger').click()
    await page.getByTestId('progress-more-force-complete').click()
    await page.getByTestId('progress-force-confirm').click()
  }
  await settleToast(page)
}

test.describe('toasts icons v2 artifacts', () => {
  test.use({ viewport: VIEWPORT })

  test('dark: progress, inventory, toasts', async ({ page }) => {
    await seedStore(page, onboardedState('dark'))
    await waitForLoadedPage(page, '/progress', 'progress-page')
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-progress-outline-nav.png') })

    await completeRebirthWithToast(page)
    await page.waitForTimeout(450)
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-toast-rebirth-success-undo.png') })

    await page.getByTestId('toast-action').click()
    await settleToast(page)
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-toast-rebirth-undone.png') })

    await waitForLoadedPage(page, '/inventory', 'inventory-page')
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-inventory-outline-nav.png') })

    await waitForLoadedPage(page, '/settings', 'settings-page')
    await page.getByTestId('settings-reset-trigger').click()
    await page.getByTestId('settings-reset-confirm').click()
    await settleToast(page)
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-toast-reset-warning.png') })
  })

  test('dark: import error toast', async ({ page }) => {
    await seedStore(page, onboardedState('dark'))
    await waitForLoadedPage(page, '/settings', 'settings-page')
    await triggerImportFail(page)
    await page.screenshot({ path: path.join(ARTIFACTS, 'dark-toast-import-error.png') })
  })

  test('light: progress, inventory, toasts', async ({ page }) => {
    await seedStore(page, onboardedState('light'))
    await waitForLoadedPage(page, '/progress', 'progress-page')
    await page.screenshot({ path: path.join(ARTIFACTS, 'light-progress-outline-nav.png') })

    await completeRebirthWithToast(page)
    await page.waitForTimeout(450)
    await page.screenshot({ path: path.join(ARTIFACTS, 'light-toast-rebirth-success-undo.png') })

    await waitForLoadedPage(page, '/inventory', 'inventory-page')
    await page.screenshot({ path: path.join(ARTIFACTS, 'light-inventory-outline-nav.png') })

    await waitForLoadedPage(page, '/settings', 'settings-page')
    await triggerImportFail(page)
    await page.waitForTimeout(450)
    await page.screenshot({ path: path.join(ARTIFACTS, 'light-toast-import-error.png') })
  })
})
