import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/expand-all'
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

async function seedOnboarded(page: Page, theme: 'dark' | 'light') {
  await seedStore(page, {
    schemaVersion: 2,
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
    inventory: [{ id: 'u1', droidId: 'a-lt', tier: 'default', quantity: 1 }],
    settings: {
      locale: 'pt-BR',
      localeSource: 'user',
      theme,
      trackInventory: true,
      animationsEnabled: false,
      disputedPreference: {},
      installBannerDismissed: true,
      iosInstallHintDismissed: true,
      progressListAllExpanded: true,
    },
    lastSavedAt: new Date().toISOString(),
  })
}

async function openProgressList(page: Page) {
  await page.goto('/progress', { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
  await page.getByTestId('progress-rebirth-list').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('progress-rebirth-list')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('progress-list-expand-all')).toBeVisible()
}

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
})

test.describe('expand-all artifacts', () => {
  test('mobile dark expanded, dark collapsed, light expanded', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await seedOnboarded(page, 'dark')
    await openProgressList(page)
    await expect(page.getByTestId('progress-list-expand-all')).toHaveAttribute('aria-expanded', 'true')
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-expanded.png'), fullPage: true })

    await page.getByTestId('progress-list-expand-all').click()
    await expect(page.getByTestId('progress-list-expand-all')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByTestId('progress-list-expand-all')).toContainText('Expandir todos')
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-collapsed.png'), fullPage: true })

    await seedOnboarded(page, 'light')
    await openProgressList(page)
    await expect(page.getByTestId('progress-list-expand-all')).toContainText('Recolher todos')
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-light-expanded.png'), fullPage: true })
  })
})
