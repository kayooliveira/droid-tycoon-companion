import { test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ARTIFACTS =
  process.env.UX_ARTIFACTS_DIR ?? path.join(process.cwd(), 'docs/ux-round-screenshots')

async function waitOnboardingStep(page: import('@playwright/test').Page, step: string) {
  const testId = `onboarding-step-${step}`
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByTestId(testId).getByTestId('onboarding-heading').waitFor({ state: 'visible' })
  await page.waitForFunction(
    (id) => {
      const el = document.querySelector(`[data-testid="${id}"]`)
      if (!el) return false
      const style = getComputedStyle(el)
      if (Number.parseFloat(style.opacity) < 0.9) return false
      const heading = el.querySelector('[data-testid="onboarding-heading"]')
      return Boolean(heading?.textContent?.trim())
    },
    testId,
    { timeout: 10000 },
  )
  await page.waitForTimeout(120)
}

async function seedPtBr(page: import('@playwright/test').Page, theme: 'dark' | 'light' = 'dark') {
  await page.goto('/onboarding')
  await page.evaluate((themeMode) => {
    localStorage.clear()
    const seed = {
      state: {
        schemaVersion: 2,
        onboardingComplete: false,
        settings: {
          locale: 'pt-BR',
          localeSource: 'user',
          theme: themeMode,
          trackInventory: true,
          animationsEnabled: true,
          disputedPreference: {},
          installBannerDismissed: false,
          iosInstallHintDismissed: false,
        },
        progress: {
          pathId: 'path-1',
          nextRebirth: 1,
          completedOnPath: 0,
        },
        inventory: [],
        lastSavedAt: new Date().toISOString(),
      },
      version: 0,
    }
    localStorage.setItem('droid-tycoon-companion-store', JSON.stringify(seed))
  }, theme)
  await page.reload()
  await page.waitForTimeout(200)
}

async function writeIconArtifacts() {
  const publicDir = path.join(process.cwd(), 'public')
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await fs.promises.copyFile(path.join(publicDir, 'pwa-512.png'), path.join(ARTIFACTS, 'icon-512.png'))

  const size = 512
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  )
  await sharp(path.join(publicDir, 'pwa-512-maskable.png'))
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(path.join(ARTIFACTS, 'icon-maskable-preview.png'))
}

async function captureDashboard(
  page: import('@playwright/test').Page,
  fileName: string,
  theme: 'dark' | 'light',
) {
  await seedPtBr(page, theme)
  await page.getByTestId('onboarding-skip').click()
  await page.waitForURL('/', { timeout: 10000 })
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(350)
  await page.screenshot({ path: path.join(ARTIFACTS, fileName), fullPage: false })
}

test('ux round screenshots (pt-BR artifacts)', async ({ page, browser }) => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await writeIconArtifacts()

  await page.setViewportSize({ width: 390, height: 844 })
  await seedPtBr(page)

  await waitOnboardingStep(page, 'welcome')
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-1.png') })

  await page.getByTestId('onboarding-start').click()
  await waitOnboardingStep(page, 'cycle')
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-2.png') })

  await page.getByTestId('onboarding-next').click()
  await waitOnboardingStep(page, 'progress')
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-3.png') })

  await page.getByTestId('onboarding-next').click()
  await waitOnboardingStep(page, 'features')
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-4.png') })

  const desktop = await browser.newPage()
  await desktop.setViewportSize({ width: 1280, height: 800 })
  await seedPtBr(desktop)
  await waitOnboardingStep(desktop, 'welcome')
  await desktop.screenshot({ path: path.join(ARTIFACTS, 'onboarding-desktop.png'), fullPage: false })
  await desktop.close()

  await captureDashboard(page, 'dashboard.png', 'dark')

  const lightPage = await browser.newPage()
  await lightPage.setViewportSize({ width: 390, height: 844 })
  await captureDashboard(lightPage, 'dashboard-light.png', 'light')
  await lightPage.close()
})
