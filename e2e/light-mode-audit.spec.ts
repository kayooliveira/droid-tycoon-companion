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

async function waitForLoadedPage(page: Page, path: string, readyTestId: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId(readyTestId)).toBeVisible({ timeout: 25_000 })
}

async function waitForMainImages(page: Page, maxImages = 24) {
  await page
    .waitForFunction(
      (max) => {
        const imgs = [...document.querySelectorAll('main img[src]')].slice(0, max) as HTMLImageElement[]
        if (imgs.length === 0) return true
        return imgs.every((img) => img.complete && img.naturalWidth > 0)
      },
      maxImages,
      { timeout: 4000 },
    )
    .catch(() => undefined)
}

async function axeScan(
  page: Page,
  label: string,
  opts?: { exclude?: string[]; include?: string[] },
) {
  let builder = new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .disableRules(['region'])
  if (opts?.include?.length) {
    for (const sel of opts.include) {
      builder = builder.include(sel)
    }
  }
  for (const sel of opts?.exclude ?? []) {
    builder = builder.exclude(sel)
  }
  const results = await builder.analyze()
  const contrast = results.violations.filter((v) => v.id === 'color-contrast')
  expect(contrast, `color-contrast violations on ${label}`).toEqual([])
}

async function shot(page: Page, name: string, opts?: { maxImages?: number }) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await waitForMainImages(page, opts?.maxImages)
  await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`), fullPage: false })
}

test.describe('light mode audit', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await context.addInitScript(() => {
      document.documentElement.classList.add('e2e-safe-area')
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistrations().then((regs) => {
          for (const reg of regs) void reg.unregister()
        })
      }
    })
    await context.route('**/sw.js', (route) => route.abort())
    await context.route('**/workbox-*.js', (route) => route.abort())
  })

  test('routes, contrast and route screenshots', async ({ page }) => {
    test.setTimeout(180_000)
    await seedLightOnboarded(page)

    await waitForLoadedPage(page, '/', 'home-hub')
    await axeScan(page, 'dashboard')
    await shot(page, 'light-dashboard')

    await waitForLoadedPage(page, '/progress', 'progress-page')
    await expect(page.getByTestId('path-switcher-trigger')).toBeVisible()
    await axeScan(page, 'progress-focus')
    await shot(page, 'light-progress-focus')
    await page.getByRole('radio', { name: /Lista/i }).click()
    await expect(page.getByTestId('progress-page')).toBeVisible()
    await shot(page, 'light-progress-list')

    await waitForLoadedPage(page, '/cycles', 'cycles-page')
    await axeScan(page, 'cycles')
    await shot(page, 'light-cycles')

    await waitForLoadedPage(page, '/inventory', 'inventory-page')
    await axeScan(page, 'inventory')
    await shot(page, 'light-inventory')

    await waitForLoadedPage(page, '/sell', 'sell-page')
    await axeScan(page, 'sell')
    await shot(page, 'light-sell')

    await waitForLoadedPage(page, '/droiddex', 'droiddex-page')
    await axeScan(page, 'droiddex-toolbar', {
      include: ['[data-testid="droiddex-page"] input', '[data-testid="droiddex-class-chips"]'],
    })
    await axeScan(page, 'droiddex-card-sample', {
      include: ['[data-testid="droiddex-grid"] > button:first-child'],
    })
    await shot(page, 'light-droiddex', { maxImages: 8 })

    await waitForLoadedPage(page, '/fusion', 'fusion-page')
    await axeScan(page, 'fusion-header', {
      include: ['[data-testid="fusion-page"] > div:first-child'],
    })
    await axeScan(page, 'fusion-rules', {
      include: ['[data-testid="fusion-rules-card"]'],
    })
    await shot(page, 'light-fusion', { maxImages: 12 })

    await waitForLoadedPage(page, '/about', 'about-page')
    await axeScan(page, 'about')
    await shot(page, 'light-about')

    await waitForLoadedPage(page, '/settings', 'settings-page')
    await axeScan(page, 'settings')
    await shot(page, 'light-settings')

    await waitForLoadedPage(page, '/404', 'not-found-page')
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
    await page.goto('/onboarding', { waitUntil: 'domcontentloaded', timeout: 45_000 })
    await expect(page.getByTestId('onboarding-shell')).toBeVisible()
    await axeScan(page, 'onboarding')
    await shot(page, 'light-onboarding')
  })

  test('overlays, install banner and dark regression screenshots', async ({ page, context }) => {
    test.setTimeout(180_000)
    await seedLightOnboarded(page)
    await waitForLoadedPage(page, '/', 'home-hub')

    await page.getByTestId('mobile-more-nav').click()
    await expect(page.getByTestId('nav-more-modal')).toBeVisible()
    await axeScan(page, 'nav-more')
    await shot(page, 'light-overlay-nav-more')
    await page.getByTestId('nav-more-modal-close').click()

    await waitForLoadedPage(page, '/droiddex', 'droiddex-page')
    await page.locator('button.glass-panel').first().click()
    await expect(page.getByTestId('droiddex-detail-modal')).toBeVisible()
    await shot(page, 'light-overlay-droiddex-detail')
    await page.getByTestId('droiddex-detail-modal-close').click()

    await waitForLoadedPage(page, '/inventory', 'inventory-page')
    await page.getByTestId('inventory-add-open').click()
    await expect(page.getByTestId('inventory-add-modal')).toBeVisible()
    await shot(page, 'light-overlay-inventory-add')
    await page.getByTestId('inventory-add-modal-close').click()

    await waitForLoadedPage(page, '/progress', 'progress-page')
    await page.getByTestId('progress-super-cta').click()
    await expect(page.getByTestId('progress-super-confirm-modal')).toBeVisible()
    await shot(page, 'light-overlay-super-confirm')
    await page.getByTestId('progress-super-cancel').click()

    await page.getByTestId('path-switcher-trigger').click()
    await expect(page.getByTestId('path-switch-modal')).toBeVisible()
    await shot(page, 'light-overlay-path-switch')
    await page.getByTestId('path-switch-modal-close').click()

    await page.getByTestId('progress-undo-inline').click()
    await expect(page.getByTestId('progress-undo-modal')).toBeVisible()
    await shot(page, 'light-overlay-progress-undo')
    await page.getByTestId('progress-undo-cancel').click()

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
    await waitForLoadedPage(page, '/', 'home-hub')
    await expect(page.getByTestId('install-banner')).toBeVisible({ timeout: 8000 })
    await shot(page, 'light-overlay-install-banner')

    await seedLightOnboarded(page, { theme: 'dark' })
    await waitForLoadedPage(page, '/', 'home-hub')
    await expect(page.locator('html')).not.toHaveClass('theme-light')
    await shot(page, 'dark-regression-dashboard')
    await waitForLoadedPage(page, '/progress', 'progress-page')
    await shot(page, 'dark-regression-progress')
  })
})
