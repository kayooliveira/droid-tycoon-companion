import { test, expect } from '@playwright/test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/pdf-guide'
const STORE_KEY = 'droid-tycoon-companion-store'

async function seedPt(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        state: {
          schemaVersion: 2,
          onboardingComplete: true,
          progress: { pathId: 'path-1', nextRebirth: 5, completedOnPath: 4 },
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

function pageCount(pdfPath: string): number {
  const out = execSync(`pdfinfo "${pdfPath}" | awk '/Pages:/ {print $2}'`, { encoding: 'utf8' }).trim()
  return Number.parseInt(out, 10) || 1
}

function rasterizeAllPages(pdfFile: string, outPrefix: string) {
  const pdfPath = path.join(ARTIFACTS, pdfFile)
  const pages = pageCount(pdfPath)
  const prefix = path.join(ARTIFACTS, outPrefix)
  execSync(`pdftoppm -png -r 110 -f 1 -l ${pages} "${pdfPath}" "${prefix}"`, {
    stdio: 'pipe',
  })
  return pages
}

test('guide and progress PDF artifacts (dark theme)', async ({ page }) => {
  test.setTimeout(180_000)
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await seedPt(page)

  await page.goto('/cycles')

  async function downloadGuide(pathId: string, fileName: string) {
    await page.getByTestId(`cycles-chip-${pathId}`).click()
    const guideDownload = page.waitForEvent('download')
    await page.getByTestId('export-cycle-guide-pdf').click()
    const g = await guideDownload
    await g.saveAs(path.join(ARTIFACTS, fileName))
  }

  await downloadGuide('path-1', 'pdf-guide-ciclo-1.pdf')
  await downloadGuide('path-2', 'pdf-guide-ciclo-2.pdf')

  await page.goto('/progress')
  const progressDownload = page.waitForEvent('download')
  await page.getByTestId('export-progress-pdf').click()
  const p = await progressDownload
  await p.saveAs(path.join(ARTIFACTS, 'pdf-progress-p1.pdf'))

  for (const file of ['pdf-guide-ciclo-1.pdf', 'pdf-guide-ciclo-2.pdf', 'pdf-progress-p1.pdf']) {
    expect(fs.statSync(path.join(ARTIFACTS, file)).size).toBeGreaterThan(2000)
  }

  const c1Pages = rasterizeAllPages('pdf-guide-ciclo-1.pdf', 'pdf-guide-ciclo-1-page')
  const c2Pages = rasterizeAllPages('pdf-guide-ciclo-2.pdf', 'pdf-guide-ciclo-2-page')
  const p1Pages = rasterizeAllPages('pdf-progress-p1.pdf', 'pdf-progress-p1-page')

  expect(c1Pages).toBeGreaterThan(0)
  expect(c2Pages).toBeGreaterThan(0)
  expect(p1Pages).toBeGreaterThan(0)
})
