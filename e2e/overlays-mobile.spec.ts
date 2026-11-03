import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/overlays'
const STORE_KEY = 'droid-tycoon-companion-store'

type StoreSeed = {
  onboardingComplete?: boolean
  progress?: { pathId: string; nextRebirth: number; completedOnPath: number }
  inventory?: unknown[]
  settings?: Record<string, unknown>
}

async function seedOnboarded(page: Page, patch?: StoreSeed) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, patch: p }) => {
      const state = {
        schemaVersion: 2,
        onboardingComplete: p?.onboardingComplete ?? true,
        progress: p?.progress ?? { pathId: 'path-1', nextRebirth: 3, completedOnPath: 2 },
        inventory: p?.inventory ?? [],
        settings: {
          locale: 'pt-BR',
          localeSource: 'user',
          theme: 'dark',
          trackInventory: true,
          animationsEnabled: true,
          disputedPreference: {},
          installBannerDismissed: true,
          iosInstallHintDismissed: true,
          ...(p?.settings ?? {}),
        },
        lastSavedAt: new Date().toISOString(),
      }
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, patch },
  )
  await page.reload()
  await page.goto('/')
  await expect(page.getByTestId('mobile-more-nav')).toBeVisible({ timeout: 15000 })
}

async function assertTopmostTestId(page: Page, testId: string) {
  const target = page.getByTestId(testId)
  await expect(target).toBeVisible()
  const box = await target.boundingBox()
  expect(box).toBeTruthy()
  const x = box!.x + box!.width / 2
  const y = box!.y + box!.height / 2
  const hit = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y)
    if (!el) return null
    const marked = el.closest('[data-testid]')
    return marked?.getAttribute('data-testid') ?? el.tagName
  }, { x, y })
  expect(hit).toBe(testId)
}

async function shot(page: Page, name: string) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.screenshot({
    path: path.join(ARTIFACTS, `${name}.png`),
    fullPage: false,
  })
}

test.describe('mobile overlay stacking', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => {
      document.documentElement.classList.add('e2e-safe-area')
    })
  })

  test('overlays render above the floating nav', async ({ page }) => {
    test.setTimeout(120_000)
    await seedOnboarded(page)

    await page.getByTestId('mobile-more-nav').click()
    await expect(page.getByTestId('nav-more-modal')).toBeVisible()
    await assertTopmostTestId(page, 'nav-more-modal-close')
    await shot(page, 'nav-more-modal')
    await page.getByTestId('nav-more-modal-close').click()

    await page.goto('/droiddex')
    await page.locator('button.glass-panel').first().click()
    await expect(page.getByTestId('droiddex-detail-modal')).toBeVisible()
    await assertTopmostTestId(page, 'droiddex-detail-modal-close')
    await shot(page, 'droiddex-detail-modal')
    await page.getByTestId('droiddex-detail-modal-close').click()

    await page.goto('/inventory')
    await expect(page.getByTestId('inventory-page')).toBeVisible()
    await shot(page, 'inventory-page')
    await page.getByTestId('inventory-add-open').click()
    await expect(page.getByTestId('inventory-add-modal')).toBeVisible()
    await assertTopmostTestId(page, 'inventory-add-confirm')
    await shot(page, 'inventory-add-modal')
    await page.getByTestId('inventory-add-modal-close').click()

    await page.goto('/progress')
    await page.getByTestId('path-switcher-trigger').click()
    await expect(page.getByTestId('path-switch-modal')).toBeVisible()
    await assertTopmostTestId(page, 'path-switcher-confirm')
    await shot(page, 'path-switch-modal')
    await page.getByTestId('path-switch-modal-close').click()

    await page.getByTestId('progress-force-complete-inline').click()
    await expect(page.getByTestId('progress-force-complete-modal')).toBeVisible()
    await assertTopmostTestId(page, 'progress-force-confirm')
    await shot(page, 'progress-force-complete-modal')
    await page.getByTestId('progress-force-cancel').click()

    await page.getByTestId('progress-undo-inline').click()
    await expect(page.getByTestId('progress-undo-modal')).toBeVisible()
    await assertTopmostTestId(page, 'progress-undo-confirm')
    await shot(page, 'progress-undo-modal')
    await page.getByTestId('progress-undo-cancel').click()

    await page.goto('/settings')
    await page.getByTestId('settings-data-help-trigger').click()
    await expect(page.getByTestId('settings-data-help-modal')).toBeVisible()
    await assertTopmostTestId(page, 'settings-data-help-modal-close')
    await shot(page, 'settings-data-help-modal')
    await page.getByTestId('settings-data-help-modal-close').click()

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('pwa-need-refresh'))
    })
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 5000 })
    await assertTopmostTestId(page, 'toast-action')
    await shot(page, 'toast-action')
  })

  test('onboarding shell covers the viewport', async ({ page }) => {
    await page.goto('/onboarding')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByTestId('onboarding-shell')).toBeVisible()
    await page.getByTestId('onboarding-start').click()
    await page.getByTestId('onboarding-next').click()
    await page.getByTestId('onboarding-next').click()
    await expect(page.getByTestId('onboarding-finish')).toBeVisible()
    await assertTopmostTestId(page, 'onboarding-finish')
    await shot(page, 'onboarding-finish')
  })

  test('install banner actions sit above the nav', async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        get: () =>
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      })
    })
    await seedOnboarded(page, {
      settings: { installBannerDismissed: false, iosInstallHintDismissed: false },
    })
    await page.goto('/')
    await expect(page.getByTestId('install-banner')).toBeVisible({ timeout: 8000 })
    await assertTopmostTestId(page, 'install-banner-dismiss')
    await shot(page, 'install-banner')
  })
})
