import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts'
const STORE_KEY = 'droid-tycoon-companion-store'

async function seedPt(page: import('@playwright/test').Page, onboardingComplete: boolean) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, onboardingComplete }) => {
      localStorage.clear()
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 2,
            onboardingComplete,
            progress: { pathId: 'path-1', nextRebirth: 3, completedOnPath: 2 },
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
    },
    { key: STORE_KEY, onboardingComplete },
  )
  await page.reload()
  await page.waitForTimeout(200)
}

test('pt-BR page screenshots 390x844', async ({ page }) => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.setViewportSize({ width: 390, height: 844 })

  await seedPt(page, false)
  await page.getByTestId('onboarding-step-welcome').waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-1.png') })
  await page.getByTestId('onboarding-next').click()
  await page.getByTestId('onboarding-step-cycles').waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-2.png') })
  await page.getByTestId('onboarding-next').click()
  await page.getByTestId('onboarding-step-inventory').waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-3.png') })
  await page.getByTestId('onboarding-next').click()
  await page.getByTestId('onboarding-step-progress').waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-4.png') })

  await seedPt(page, true)
  const shots: Array<[string, string]> = [
    ['/', 'home'],
    ['/progress', 'progresso'],
    ['/cycles', 'ciclos'],
    ['/inventory', 'inventario'],
    ['/sell', 'vender'],
    ['/droiddex', 'droiddex'],
    ['/fusion', 'fusao'],
    ['/settings', 'ajustes'],
    ['/about', 'sobre'],
  ]

  for (const [route, file] of shots) {
    await page.goto(route)
    await page.waitForTimeout(350)
    if (route === '/') await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: path.join(ARTIFACTS, `${file}.png`) })
  }
})
