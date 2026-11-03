import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/droid-search'
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
    progress: { pathId: 'path-1', nextRebirth: 8, completedOnPath: 7 },
    inventory: [],
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

async function openProgressSearch(page: Page) {
  await page.goto('/progress', { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
  await expect(page.getByTestId('progress-droid-search')).toBeVisible()
}

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
})

test.describe('droid search artifacts', () => {
  test('mobile search motrak, never needed, highlight after tap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await seedOnboarded(page, 'dark')
    await openProgressSearch(page)
    const search = page.getByTestId('progress-droid-search-input')
    await search.fill('motrak')
    await expect(page.getByTestId('progress-search-path-path-1')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="progress-droid-search"]').screenshot({
      path: path.join(ARTIFACTS, 'mobile-dark-motrak.png'),
    })

    await search.fill('whl-ex')
    await expect(page.getByTestId('progress-droid-search-never')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="progress-droid-search"]').screenshot({
      path: path.join(ARTIFACTS, 'mobile-dark-never-needed.png'),
    })

    await seedOnboarded(page, 'light')
    await openProgressSearch(page)
    await page.getByTestId('progress-droid-search-input').fill('motrak')
    await expect(page.getByTestId('progress-search-path-path-1')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="progress-droid-search"]').screenshot({
      path: path.join(ARTIFACTS, 'mobile-light-motrak.png'),
    })

    await seedOnboarded(page, 'dark')
    await openProgressSearch(page)
    await page.getByTestId('progress-droid-search-input').fill('motrak')
    const firstHit = page.locator('[data-testid^="progress-search-hit-path-1-"]').first()
    await expect(firstHit).toBeVisible({ timeout: 8000 })
    await firstHit.click()
    await expect(page.getByTestId('progress-rebirth-list')).toBeVisible()
    await expect(page.locator('[data-highlighted="true"]')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="progress-rebirth-list"]').screenshot({
      path: path.join(ARTIFACTS, 'mobile-dark-step-highlight.png'),
    })
  })
})
