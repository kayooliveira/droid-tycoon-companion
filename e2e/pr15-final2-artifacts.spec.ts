import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/pr15-final2'
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

async function seedProgress(page: Page, theme: 'dark' | 'light', inventory: unknown[]) {
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

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
})

test.describe('PR15 final2 viewport artifacts', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  test('steppers, cleared search, motrak', async ({ page }) => {
    await seedProgress(page, 'dark', [
      { id: 'u1', droidId: 'hov-r', tier: 'diamond', quantity: 1 },
    ])
    await page.goto('/progress', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })

    await page.getByText('Renascimento #8 agora').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('requirement-droid-name').filter({ hasText: 'HOV-R' })).toBeVisible()
    await expect(
      page.getByTestId('requirement-droid-name').filter({ hasText: 'Util-Tec' }),
    ).toBeVisible()
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-steppers.png'), fullPage: false })

    await page.getByTestId('progress-droid-search-input').fill('motrak')
    await expect(page.getByTestId('progress-search-path-path-1')).toBeVisible({ timeout: 8000 })
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-motrak.png'), fullPage: false })

    await page.getByTestId('progress-droid-search-clear').click()
    await expect(page.getByTestId('progress-search-path-path-1')).toHaveCount(0)
    await expect(page.getByText('MO-TRAK')).toHaveCount(0)
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-dark-search-cleared.png'), fullPage: false })

    await seedProgress(page, 'light', [
      { id: 'u1', droidId: 'hov-r', tier: 'diamond', quantity: 1 },
    ])
    await page.goto('/progress', { waitUntil: 'domcontentloaded' })
    await page.getByText('Renascimento #8 agora').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('requirement-droid-name').filter({ hasText: 'Util-Tec' })).toContainText(
      'Util-Tec',
    )
    await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-light-steppers.png'), fullPage: false })
  })
})
