import { test, expect } from '@playwright/test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/sell-fix'
const STORE_KEY = 'droid-tycoon-companion-store'

async function seedPt(page: import('@playwright/test').Page, progress: { nextRebirth: number; completedOnPath: number }) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, progress: p }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 2,
            onboardingComplete: true,
            progress: { pathId: 'path-3', ...p },
            inventory: [{ id: 'u1', droidId: 'mo-trak', tier: 'gold', quantity: 1 }],
            settings: {
              locale: 'pt-BR',
              localeSource: 'user',
              theme: 'dark',
              trackInventory: true,
              animationsEnabled: false,
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
    { key: STORE_KEY, progress },
  )
  await page.reload()
}

function pageCount(pdfPath: string): number {
  const out = execSync(`pdfinfo "${pdfPath}" | awk '/Pages:/ {print $2}'`, { encoding: 'utf8' }).trim()
  return Number.parseInt(out, 10) || 1
}

function rasterizeAllPages(pdfFile: string, outPrefix: string) {
  const pdfPath = path.join(ARTIFACTS, pdfFile)
  const pages = pageCount(pdfPath)
  const prefix = path.join(ARTIFACTS, outPrefix)
  execSync(`pdftoppm -png -r 110 -f 1 -l ${pages} "${pdfPath}" "${prefix}"`, { stdio: 'pipe' })
  return pages
}

test('sell fix PDF and mobile screenshots', async ({ page }) => {
  test.setTimeout(180_000)
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await seedPt(page, { nextRebirth: 26, completedOnPath: 25 })

  await page.goto('/cycles', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('cycles-chip-path-1').click()
  const guideDownload = page.waitForEvent('download')
  await page.getByTestId('export-cycle-guide-pdf').click()
  const g = await guideDownload
  await g.saveAs(path.join(ARTIFACTS, 'pdf-guide-ciclo-1.pdf'))

  await page.goto('/progress', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 20_000 })
  const progressDownload = page.waitForEvent('download')
  await page.getByTestId('export-progress-pdf').click()
  const p = await progressDownload
  await p.saveAs(path.join(ARTIFACTS, 'pdf-progress-p1.pdf'))

  const c1Pages = rasterizeAllPages('pdf-guide-ciclo-1.pdf', 'pdf-guide-ciclo-1-page')
  const p1Pages = rasterizeAllPages('pdf-progress-p1.pdf', 'pdf-progress-p1-page')
  expect(c1Pages).toBeGreaterThan(0)
  expect(p1Pages).toBeGreaterThan(0)

  await page.goto('/sell', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('sell-page')).toBeVisible({ timeout: 20_000 })
  await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-sell-path3.png'), fullPage: false })

  await page.goto('/progress', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 20_000 })
  await page.screenshot({ path: path.join(ARTIFACTS, 'mobile-progress-path3.png'), fullPage: false })
})
