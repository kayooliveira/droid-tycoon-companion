import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/confirm'
const STORE_KEY = 'droid-tycoon-companion-store'

type ProgressSeed = {
  progress: { pathId: string; nextRebirth: number; completedOnPath: number }
  settings?: Record<string, unknown>
  inventory?: unknown[]
}

async function seedProgress(page: Page, seed: ProgressSeed | ProgressSeed['progress']) {
  const normalized: ProgressSeed =
    'pathId' in seed ? { progress: seed } : seed
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, seed: s }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 2,
            onboardingComplete: true,
            progress: s.progress,
            inventory: s.inventory ?? [],
            settings: {
              locale: 'pt-BR',
              localeSource: 'user',
              theme: 'dark',
              trackInventory: true,
              animationsEnabled: true,
              disputedPreference: {},
              installBannerDismissed: true,
              iosInstallHintDismissed: true,
              ...(s.settings ?? {}),
            },
            lastSavedAt: new Date().toISOString(),
          },
          version: 0,
        }),
      )
    },
    { key: STORE_KEY, seed: normalized },
  )
  await page.reload()
  await page.goto('/progress')
}

async function shot(page: Page, name: string) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.screenshot({
    path: path.join(ARTIFACTS, `${name}.png`),
    fullPage: false,
  })
}

test.describe('confirmation modals', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => {
      document.documentElement.classList.add('e2e-safe-area')
    })
  })

  test('Super Renascimento requires confirmation', async ({ page }) => {
    await seedProgress(page, { progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 } })
    await expect(page.getByTestId('progress-super-cta')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('progress-super-cta').click()
    await expect(page.getByTestId('progress-super-confirm-modal')).toBeVisible()
    await shot(page, 'progress-super-confirm')

    await page.getByTestId('progress-super-cancel').click()
    await expect(page.getByTestId('progress-super-confirm-modal')).toBeHidden()
    await expect(page.getByTestId('path-switcher-trigger')).toContainText(/Ciclo 1/i)

    await page.getByTestId('progress-super-cta').click()
    await page.getByTestId('progress-super-confirm').click()
    await expect(page.getByTestId('progress-super-confirm-modal')).toBeHidden()
    await expect(page.getByTestId('path-switcher-trigger')).toContainText(/Ciclo 2/i)
  })

  test('Concluir advances immediately when inventory is ready', async ({ page }) => {
    await seedProgress(page, {
      progress: { pathId: 'path-1', nextRebirth: 3, completedOnPath: 2 },
      inventory: [
        { id: 'u1', droidId: 'a-lt', tier: 'default', quantity: 1 },
        { id: 'u2', droidId: 'b-u4d', tier: 'default', quantity: 1 },
        { id: 'u3', droidId: 'r9', tier: 'gold', quantity: 1 },
      ],
    })
    await expect(page.getByRole('button', { name: /^Concluir$/ })).toBeEnabled({ timeout: 15000 })
    await page.getByRole('button', { name: /^Concluir$/ }).click()
    await expect(page.getByTestId('progress-complete-confirm-modal')).toHaveCount(0)
    const nextRebirth = await page.evaluate(({ key }) => {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      return JSON.parse(raw).state.progress.nextRebirth as number
    }, { key: STORE_KEY })
    expect(nextRebirth).toBe(4)
  })

  test('inventory remove confirmation screenshot', async ({ page }) => {
    await page.goto('/onboarding')
    await page.evaluate(
      ({ key }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            state: {
              schemaVersion: 2,
              onboardingComplete: true,
              progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
              inventory: [
                {
                  id: 'unit-test-1',
                  droidId: 'r2-d2',
                  tier: 'default',
                  quantity: 1,
                },
              ],
              settings: {
                locale: 'pt-BR',
                localeSource: 'user',
                theme: 'dark',
                trackInventory: true,
                animationsEnabled: true,
                disputedPreference: {},
                installBannerDismissed: true,
                iosInstallHintDismissed: true,
              },
              lastSavedAt: new Date().toISOString(),
            },
            version: 0,
          }),
        )
      },
      { key: STORE_KEY },
    )
    await page.goto('/inventory')
    await page.getByTestId('inventory-remove-unit-test-1').click()
    await expect(page.getByTestId('inventory-remove-modal')).toBeVisible()
    await shot(page, 'inventory-remove-confirm')
    await page.getByTestId('inventory-remove-cancel').click()
  })

  test('settings import and reset confirmation screenshots', async ({ page }) => {
    await page.goto('/onboarding')
    await page.evaluate(({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 2,
            onboardingComplete: true,
            progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
            inventory: [],
            settings: {
              locale: 'pt-BR',
              localeSource: 'user',
              theme: 'dark',
              trackInventory: true,
              animationsEnabled: true,
              disputedPreference: {},
              installBannerDismissed: true,
              iosInstallHintDismissed: true,
            },
            lastSavedAt: new Date().toISOString(),
          },
          version: 0,
        }),
      )
    }, { key: STORE_KEY })
    await page.goto('/settings')
    await page.getByTestId('settings-reset-trigger').click()
    await expect(page.getByTestId('settings-reset-modal')).toBeVisible()
    await shot(page, 'settings-reset-confirm')
    await page.getByTestId('settings-reset-cancel').click()

    const exportPayload = await page.evaluate(({ key }) => {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    }, { key: STORE_KEY })

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByTestId('settings-import-trigger').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(exportPayload)),
    })
    await expect(page.getByTestId('modal-importar')).toBeVisible()
    await shot(page, 'settings-import-confirm')
    await page.getByTestId('settings-import-cancel').click()
  })
})
