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

const BEAT_MS = [200, 400, 700, 1180, 3000] as const

type TrimSpec = { fromSec: number; toSec: number }

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

function saveVideoWebm(source: string, destBase: string, trim?: TrimSpec) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  const webm = `${destBase}.webm`
  const mp4 = `${destBase}.mp4`
  const duration =
    trim && trim.toSec > trim.fromSec ? trim.toSec - trim.fromSec : undefined

  if (duration != null && duration > 0.5) {
    const from = Math.max(0, trim!.fromSec)
    const t = duration.toFixed(3)
    const ss = from.toFixed(3)
    execSync(
      `ffmpeg -y -ss ${ss} -i "${source}" -t ${t} -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${mp4}"`,
      { stdio: 'ignore' },
    )
    try {
      execSync(
        `ffmpeg -y -ss ${ss} -i "${source}" -t ${t} -c:v libvpx-vp9 -b:v 2M -pix_fmt yuv420p "${webm}"`,
        { stdio: 'ignore' },
      )
    } catch {
      try {
        execSync(`ffmpeg -y -i "${mp4}" -c:v libvpx-vp9 -b:v 2M -pix_fmt yuv420p "${webm}"`, {
          stdio: 'ignore',
        })
      } catch {
        /* webm optional */
      }
    }
    return
  }

  if (path.resolve(source) !== path.resolve(webm)) {
    fs.copyFileSync(source, webm)
  }
  try {
    execSync(`ffmpeg -y -i "${webm}" -c:v libx264 -pix_fmt yuv420p "${mp4}"`, { stdio: 'ignore' })
  } catch {
    /* ffmpeg optional */
  }
}

async function saveCelebrationVideo(page: Page, slug: string, trim: TrimSpec) {
  const video = page.video()
  if (!video) return
  const context = page.context()
  await context.close()
  const source = await video.path()
  saveVideoWebm(source, path.join(ARTIFACTS, slug), trim)
}

async function captureBeats(page: Page, label: string, startedAt: number) {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  const beats = ['beat-01-darken', 'beat-02-ignite', 'beat-03-shock', 'beat-04-slam', 'beat-05-settle']
  for (let i = 0; i < BEAT_MS.length; i++) {
    const elapsed = Date.now() - startedAt
    await page.waitForTimeout(Math.max(0, BEAT_MS[i]! - elapsed))
    await page.screenshot({
      path: path.join(ARTIFACTS, `${label}-${beats[i]}.png`),
    })
  }
}

for (const combo of THEME_COMBOS) {
  test(`Super Renascimento celebration video ${combo.label}`, async ({ page }) => {
    test.setTimeout(120_000)
    const testT0 = Date.now()
    let confirmT = 0
    await page.addInitScript(() => {
      document.documentElement.classList.add('e2e-safe-area')
    })
    await seedSuperEligible(page, {
      appearanceTheme: combo.theme,
      appearanceMode: combo.mode,
    })
    await page.goto(`/progress?theme=${combo.theme}&mode=${combo.mode}&onboarding=skip`)
    await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })

    await expect(page.getByTestId('progress-super-cta')).toBeVisible({ timeout: 20_000 })
    await page.getByTestId('progress-super-cta').click()
    await expect(page.getByTestId('progress-super-confirm-modal')).toBeVisible()
    await page.getByTestId('progress-super-confirm').click()
    confirmT = Date.now()
    const startedAt = confirmT
    await expect(page.getByTestId('super-rebirth-celebration')).toBeVisible({ timeout: 8000 })
    await expect(page.getByTestId('toast-item')).toHaveCount(0)

    await captureBeats(page, combo.label, startedAt)

    await expect(page.getByTestId('super-rebirth-celebration')).toBeHidden({ timeout: 12_000 })
    await expect(page.getByTestId('toast-item')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('path-switcher-trigger')).toContainText(/Ciclo 2/i)

    const confirmOffset = (confirmT - testT0) / 1000
    const trim: TrimSpec = {
      fromSec: Math.max(0, confirmOffset - 1),
      toSec: confirmOffset + 6.5,
    }
    await saveCelebrationVideo(page, combo.label, trim)
  })
}

test('Super Renascimento celebration reduced motion', async ({ page }) => {
  test.setTimeout(60_000)
  const testT0 = Date.now()
  let confirmT = 0
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    document.documentElement.classList.add('e2e-safe-area')
  })
  await seedSuperEligible(page, {
    appearanceTheme: 'oficina',
    appearanceMode: 'dark',
  })
  await page.goto('/progress?theme=oficina&mode=dark&onboarding=skip')
  await expect(page.getByTestId('progress-super-cta')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('progress-super-cta').click()
  await page.getByTestId('progress-super-confirm').click()
  confirmT = Date.now()
  await expect(page.getByTestId('super-rebirth-celebration')).toBeVisible({ timeout: 8000 })
  await expect(page.getByTestId('super-rebirth-celebration')).toBeHidden({ timeout: 5000 })
  await expect(page.getByTestId('toast-item')).toBeVisible()
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.screenshot({ path: path.join(ARTIFACTS, 'reduced-motion-end.png') })
  const confirmOffset = (confirmT - testT0) / 1000
  await saveCelebrationVideo(page, 'reduced-motion', {
    fromSec: Math.max(0, confirmOffset - 1),
    toSec: confirmOffset + 3.5,
  })
})
