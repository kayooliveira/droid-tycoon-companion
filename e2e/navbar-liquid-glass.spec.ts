import { test, expect, chromium, webkit } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts'
const STORE_KEY = 'droid-tycoon-companion-store'

async function seed(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        state: {
          schemaVersion: 2,
          onboardingComplete: true,
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
  }, STORE_KEY)
  await page.reload()
}

async function captureNav(browserType: typeof chromium | typeof webkit, engine: string) {
  const browser = await browserType.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: engine === 'chromium' ? 2 : 2,
  })
  const page = await context.newPage()
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await seed(page)
  await page.goto('/droiddex')
  await page.waitForTimeout(600)
  const nav = page.getByTestId('mobile-floating-nav')
  await expect(nav).toBeVisible()
  await expect(nav.getByText('Início')).toBeVisible()
  await page.screenshot({ path: path.join(ARTIFACTS, `navbar-liquid-${engine}.png`) })
  const box = await nav.boundingBox()
  if (box) {
    await page.screenshot({
      path: path.join(ARTIFACTS, `navbar-liquid-${engine}-2x-crop.png`),
      clip: {
        x: Math.max(0, box.x - 10),
        y: Math.max(0, box.y - 10),
        width: Math.min(390, box.width + 20),
        height: Math.min(844, box.height + 20),
      },
    })
  }
  await browser.close()
}

test.describe('navbar liquid glass screenshots', () => {
  test('chromium distortion over busy background', async () => {
    await captureNav(chromium, 'chromium')
  })

  test('webkit fallback over busy background', async () => {
    await captureNav(webkit, 'webkit')
  })
})
