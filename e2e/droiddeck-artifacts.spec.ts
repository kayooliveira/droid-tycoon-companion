import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts'
const STORE_KEY = 'droid-tycoon-companion-store'

async function enableE2eSafeArea(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    document.documentElement.classList.add('e2e-safe-area')
  })
}

type ProgressSeed = {
  pathId?: string
  nextRebirth?: number
  completedOnPath?: number
  inventory?: unknown[]
}

async function seedOnboarding(
  page: import('@playwright/test').Page,
  opts: {
    locale: 'pt-BR' | 'en'
    theme: 'dark' | 'light'
    onboardingComplete?: boolean
    progress?: ProgressSeed
  },
) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, opts }) => {
      localStorage.clear()
      const seed = {
        state: {
          schemaVersion: 2,
          onboardingComplete: opts.onboardingComplete ?? false,
          settings: {
            locale: opts.locale,
            localeSource: 'user',
            theme: opts.theme,
            trackInventory: true,
            animationsEnabled: true,
            disputedPreference: {},
            installBannerDismissed: true,
            iosInstallHintDismissed: true,
          },
          progress: {
            pathId: opts.progress?.pathId ?? 'path-1',
            nextRebirth: opts.progress?.nextRebirth ?? 3,
            completedOnPath: opts.progress?.completedOnPath ?? 2,
          },
          inventory: opts.progress?.inventory ?? [],
          lastSavedAt: new Date().toISOString(),
        },
        version: 0,
      }
      localStorage.setItem(key, JSON.stringify(seed))
    },
    { key: STORE_KEY, opts },
  )
  await page.reload()
  await page.waitForTimeout(200)
}

async function waitOnboardingStep(page: import('@playwright/test').Page, step: string) {
  const testId = `onboarding-step-${step}`
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByTestId(testId).getByTestId('onboarding-heading').waitFor({ state: 'visible' })
  await page.waitForTimeout(120)
}

async function finishOnboardingSkip(page: import('@playwright/test').Page) {
  await page.getByTestId('onboarding-skip').click()
  await page.waitForURL('/', { timeout: 10000 })
  await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 10000 })
}

async function writeIcon512() {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await fs.promises.copyFile(
    path.join(process.cwd(), 'public/pwa-512.png'),
    path.join(ARTIFACTS, 'icon-512.png'),
  )
  const size = 512
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  )
  await sharp(path.join(process.cwd(), 'public/pwa-512-maskable.png'))
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(path.join(ARTIFACTS, 'icon-maskable-preview.png'))
}

test('DroidDeck UX artifacts at 390x844', async ({ page, browser }) => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await writeIcon512()

  await enableE2eSafeArea(page)
  await page.setViewportSize({ width: 390, height: 844 })

  await seedOnboarding(page, { locale: 'pt-BR', theme: 'dark' })
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

  await finishOnboardingSkip(page)
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(ARTIFACTS, 'home-pt.png') })

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(ARTIFACTS, 'home.png') })

  const lightPage = await browser.newPage()
  await enableE2eSafeArea(lightPage)
  await lightPage.setViewportSize({ width: 390, height: 844 })
  await seedOnboarding(lightPage, { locale: 'en', theme: 'light', onboardingComplete: true })
  await lightPage.goto('/')
  await expect(lightPage.getByTestId('home-hub')).toBeVisible({ timeout: 10000 })
  await lightPage.waitForTimeout(300)
  await lightPage.screenshot({ path: path.join(ARTIFACTS, 'home-light.png') })
  await lightPage.close()

  await page.goto('/progress')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(ARTIFACTS, 'progresso.png') })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(ARTIFACTS, 'progresso-scrolled-bottom.png') })

  await seedOnboarding(page, {
    locale: 'pt-BR',
    theme: 'dark',
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
  })
  await page.goto('/progress')
  await page.waitForTimeout(500)
  await expect(page.getByRole('button', { name: /Super Renascimento/i })).toBeVisible()
  await page.screenshot({ path: path.join(ARTIFACTS, 'super-cta.png') })

  await seedOnboarding(page, {
    locale: 'pt-BR',
    theme: 'dark',
    onboardingComplete: true,
    progress: { nextRebirth: 1, completedOnPath: 0 },
  })
  await page.goto('/sell')
  await page.waitForTimeout(400)
  await expect(page.getByTestId('sell-empty-state')).toBeVisible()
  await page.screenshot({ path: path.join(ARTIFACTS, 'vender-empty.png') })
  await page.screenshot({ path: path.join(ARTIFACTS, 'vender.png') })

  await page.goto('/about')
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(350)
  await expect(page.getByTestId('about-credits-footer')).toBeVisible()
  await page.screenshot({ path: path.join(ARTIFACTS, 'sobre.png') })
  await page.screenshot({ path: path.join(ARTIFACTS, 'sobre-bottom.png') })

  await page.goto('/droiddex')
  await page.waitForTimeout(500)
  await expect(page.getByTestId('mobile-floating-nav')).toBeVisible()
  await page.screenshot({ path: path.join(ARTIFACTS, 'navbar-over-busy-bg.png') })

  await page.goto('/')
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  const nav = page.getByTestId('mobile-floating-nav')
  await expect(nav).toHaveAttribute('data-nav-minimized', '1', { timeout: 5000 })
  await page.screenshot({ path: path.join(ARTIFACTS, 'navbar-minimized.png') })
})
