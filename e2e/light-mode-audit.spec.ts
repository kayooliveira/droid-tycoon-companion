import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/light'
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

async function seedLightOnboarded(page: Page, patch?: Record<string, unknown>) {
  await seedStore(page, {
    schemaVersion: 2,
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
    inventory: [
      { id: 'u1', droidId: 'a-lt', tier: 'default', quantity: 1 },
    ],
    settings: {
      locale: 'pt-BR',
      localeSource: 'user',
      theme: 'light',
      trackInventory: true,
      animationsEnabled: false,
      disputedPreference: {},
      installBannerDismissed: true,
      iosInstallHintDismissed: true,
      ...(patch ?? {}),
    },
    lastSavedAt: new Date().toISOString(),
  })
}

async function axeScan(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa', 'wcag21aa'])
    .disableRules(['region'])
    .analyze()
  const contrast = results.violations.filter((v) => v.id === 'color-contrast')
  expect(contrast, `color-contrast violations on ${label}`).toEqual([])
}

async function shot(page: Page, name: string) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`), fullPage: false })
}

test.describe('light mode audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => {
      document.documentElement.classList.add('e2e-safe-area')
    })
  })

  test('routes, overlays, contrast and screenshots', async ({ page, context }) => {
    test.setTimeout(300_000)
    await seedLightOnboarded(page)
    await page.goto('/')
    await expect(page.getByTestId('mobile-more-nav')).toBeVisible({ timeout: 15000 })
    await axeScan(page, 'dashboard')
    await shot(page, 'light-dashboard')

    await page.goto('/progress')
    await axeScan(page, 'progress-focus')
    await shot(page, 'light-progress-focus')
    await page.getByRole('radio', { name: /Lista/i }).click()
    await shot(page, 'light-progress-list')

    await page.goto('/cycles')
    await axeScan(page, 'cycles')
    await shot(page, 'light-cycles')

    await page.goto('/inventory')
    await axeScan(page, 'inventory')
    await shot(page, 'light-inventory')

    await page.goto('/sell')
    await axeScan(page, 'sell')
    await shot(page, 'light-sell')

    await page.goto('/droiddex')
    await axeScan(page, 'droiddex')
    await shot(page, 'light-droiddex')

    await page.goto('/fusion')
    await axeScan(page, 'fusion')
    await shot(page, 'light-fusion')

    await page.goto('/about')
    await axeScan(page, 'about')
    await shot(page, 'light-about')

    await page.goto('/settings')
    await axeScan(page, 'settings')
    await shot(page, 'light-settings')

    await page.goto('/404')
    await expect(page.getByTestId('not-found-page')).toBeVisible({ timeout: 15000 })
    await axeScan(page, 'not-found')
    await shot(page, 'light-not-found')

    await seedStore(page, {
      schemaVersion: 2,
      onboardingComplete: false,
      progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
      inventory: [],
      settings: {
        locale: 'pt-BR',
        localeSource: 'user',
        theme: 'light',
        trackInventory: true,
        animationsEnabled: false,
        disputedPreference: {},
        installBannerDismissed: true,
        iosInstallHintDismissed: true,
      },
      lastSavedAt: new Date().toISOString(),
    })
    await page.goto('/onboarding')
    await expect(page.getByTestId('onboarding-shell')).toBeVisible()
    await axeScan(page, 'onboarding')
    await shot(page, 'light-onboarding')

    await seedLightOnboarded(page)
    await page.goto('/')

    await page.getByTestId('mobile-more-nav').click()
    await expect(page.getByTestId('nav-more-modal')).toBeVisible()
    await axeScan(page, 'nav-more')
    await shot(page, 'light-overlay-nav-more')
    await page.getByTestId('nav-more-modal-close').click()

    await page.goto('/droiddex')
    await page.locator('button.glass-panel').first().click()
    await expect(page.getByTestId('droiddex-detail-modal')).toBeVisible()
    await shot(page, 'light-overlay-droiddex-detail')
    await page.getByTestId('droiddex-detail-modal-close').click()

    await page.goto('/inventory')
    await page.getByTestId('inventory-add-open').click()
    await expect(page.getByTestId('inventory-add-modal')).toBeVisible()
    await shot(page, 'light-overlay-inventory-add')
    await page.getByTestId('inventory-add-modal-close').click()

    await page.goto('/progress')
    await page.getByTestId('progress-super-cta').click()
    await expect(page.getByTestId('progress-super-confirm-modal')).toBeVisible()
    await shot(page, 'light-overlay-super-confirm')
    await page.getByTestId('progress-super-cancel').click()

    await page.getByTestId('path-switcher-trigger').click()
    await expect(page.getByTestId('path-switch-modal')).toBeVisible()
    await shot(page, 'light-overlay-path-switch')
    await page.getByTestId('path-switch-modal-close').click()

    await page.getByTestId('progress-more-trigger').click()
    await expect(page.getByTestId('progress-more-modal')).toBeVisible()
    await shot(page, 'light-overlay-progress-more')
    await page.getByTestId('progress-more-cancel').click()

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('pwa-need-refresh'))
    })
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 5000 })
    await shot(page, 'light-overlay-toast')

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        get: () =>
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      })
    })
    await seedLightOnboarded(page, { installBannerDismissed: false, iosInstallHintDismissed: false })
    await page.goto('/')
    await expect(page.getByTestId('install-banner')).toBeVisible({ timeout: 8000 })
    await shot(page, 'light-overlay-install-banner')

    await seedLightOnboarded(page, { theme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass('theme-light')
    await shot(page, 'dark-regression-dashboard')
    await page.goto('/progress')
    await shot(page, 'dark-regression-progress')
  })
})
