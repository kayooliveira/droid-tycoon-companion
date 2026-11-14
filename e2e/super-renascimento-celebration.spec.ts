import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const ARTIFACTS = '/opt/cursor/artifacts/super-renascimento'
const STORE_KEY = 'droid-tycoon-companion-store'

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  video: { mode: 'on', size: { width: 390, height: 844 } },
})

const THEME_COMBOS: Array<{ theme: string; mode: string; label: string }> = [
  { theme: 'oficina', mode: 'dark', label: 'oficina-dark' },
  { theme: 'oficina', mode: 'light', label: 'oficina-light' },
  { theme: 'figurinhas', mode: 'dark', label: 'figurinhas-dark' },
  { theme: 'figurinhas', mode: 'light', label: 'figurinhas-light' },
  { theme: 'cartaz', mode: 'dark', label: 'cartaz-dark' },
  { theme: 'cartaz', mode: 'light', label: 'cartaz-light' },
]

async function seedSuperEligible(page: Page, settings: Record<string, unknown>) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, settings: extra }) => {
      localStorage.clear()
      try {
        sessionStorage.setItem('dd-e2e-skip-onboarding', '1')
      } catch {
        /* ignore */
      }
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 3,
            onboardingComplete: true,
            progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
            inventory: [
              { id: 'e2e-u1', droidId: 'gonk', tier: 'default', quantity: 2 },
              { id: 'e2e-u2', droidId: 'r2-d2', tier: 'gold', quantity: 1 },
            ],
            settings: {
              locale: 'pt-BR',
              localeSource: 'user',
              theme: 'dark',
              appearanceTheme: 'oficina',
              appearanceMode: 'dark',
              trackInventory: true,
              animationsEnabled: true,
              disputedPreference: {},
              installBannerDismissed: true,
              iosInstallHintDismissed: true,
              ...extra,
            },
            lastSavedAt: new Date().toISOString(),
          },
          version: 0,
        }),
      )
    },
    { key: STORE_KEY, settings },
  )
}

async function triggerSuperRebirth(page: Page) {
  await expect(page.getByTestId('progress-super-cta')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('progress-super-cta').click()
  await expect(page.getByTestId('progress-super-confirm-modal')).toBeVisible()
  await page.getByTestId('progress-super-confirm').click()
  await expect(page.getByTestId('super-rebirth-celebration')).toBeVisible({ timeout: 8000 })
}

function saveVideoWebm(source: string, destBase: string) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  const webm = `${destBase}.webm`
  if (path.resolve(source) !== path.resolve(webm)) {
    fs.copyFileSync(source, webm)
  }
  try {
    execSync(
      `ffmpeg -y -i "${webm}" -c:v libx264 -pix_fmt yuv420p "${destBase}.mp4"`,
      { stdio: 'ignore' },
    )
  } catch {
    /* ffmpeg optional */
  }
}

function artifactSlug(title: string): string | null {
  const themed = title.match(/video ([\w-]+)$/)
  if (themed) return themed[1]!
  if (title.includes('reduced motion')) return 'reduced-motion'
  return null
}

test.afterEach(async ({}, testInfo) => {
  const slug = artifactSlug(testInfo.title)
  if (!slug) return
  const video = testInfo.attachments.find((a) => a.name === 'video')
  if (!video?.path) return
  saveVideoWebm(video.path, path.join(ARTIFACTS, slug))
})

for (const combo of THEME_COMBOS) {
  test(`Super Renascimento celebration video ${combo.label}`, async ({ page }) => {
    test.setTimeout(90_000)
    await page.addInitScript(() => {
      document.documentElement.classList.add('e2e-safe-area')
    })
    await seedSuperEligible(page, {
      appearanceTheme: combo.theme,
      appearanceMode: combo.mode,
    })
    await page.goto(`/progress?theme=${combo.theme}&mode=${combo.mode}&onboarding=skip`)
    await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })

    await triggerSuperRebirth(page)
    await expect(page.getByTestId('toast-item')).toBeVisible({ timeout: 5000 })

    fs.mkdirSync(ARTIFACTS, { recursive: true })
    await page.screenshot({
      path: path.join(ARTIFACTS, `${combo.label}-burst.png`),
    })
    await page.waitForTimeout(900)
    await page.screenshot({
      path: path.join(ARTIFACTS, `${combo.label}-slam.png`),
    })
    await page.waitForTimeout(2200)
    await page.screenshot({
      path: path.join(ARTIFACTS, `${combo.label}-settle.png`),
    })

    await expect(page.getByTestId('super-rebirth-celebration')).toBeHidden({ timeout: 8000 })
    await expect(page.getByTestId('path-switcher-trigger')).toContainText(/Ciclo 2/i)
  })
}

test('Super Renascimento celebration reduced motion', async ({ page }) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    document.documentElement.classList.add('e2e-safe-area')
  })
  await seedSuperEligible(page, {
    appearanceTheme: 'oficina',
    appearanceMode: 'dark',
  })
  await page.goto('/progress?theme=oficina&mode=dark&onboarding=skip')
  await triggerSuperRebirth(page)
  await expect(page.getByTestId('super-rebirth-celebration')).toBeHidden({ timeout: 5000 })
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.screenshot({ path: path.join(ARTIFACTS, 'reduced-motion-end.png') })
})
