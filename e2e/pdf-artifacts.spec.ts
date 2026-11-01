import { test, expect } from '@playwright/test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = process.env.UX_ARTIFACTS_DIR ?? '/opt/cursor/artifacts'
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

test('export sample PDFs (pt-BR)', async ({ page }) => {
  test.setTimeout(120_000)
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await seedPt(page)

  await page.goto('/cycles')
  const guideDownload = page.waitForEvent('download')
  await page.getByTestId('export-cycle-guide-pdf').click()
  const g = await guideDownload
  await g.saveAs(path.join(ARTIFACTS, 'pdf-ciclo-guia-pt.pdf'))

  await page.goto('/progress')
  const progressDownload = page.waitForEvent('download')
  await page.getByTestId('export-progress-pdf').click()
  const p = await progressDownload
  await p.saveAs(path.join(ARTIFACTS, 'pdf-progresso-pt.pdf'))

  expect(fs.statSync(path.join(ARTIFACTS, 'pdf-ciclo-guia-pt.pdf')).size).toBeGreaterThan(1000)
  expect(fs.statSync(path.join(ARTIFACTS, 'pdf-progresso-pt.pdf')).size).toBeGreaterThan(1000)

  const rasterize = (pdfFile: string, outPrefix: string, maxPages: number) => {
    const pdfPath = path.join(ARTIFACTS, pdfFile)
    const prefix = path.join(ARTIFACTS, outPrefix)
    execSync(`pdftoppm -png -r 110 -f 1 -l ${maxPages} "${pdfPath}" "${prefix}"`, {
      stdio: 'pipe',
    })
  }

  rasterize('pdf-ciclo-guia-pt.pdf', 'pdf-ciclo-guia-pt-page', 7)
  rasterize('pdf-progresso-pt.pdf', 'pdf-progresso-pt-page', 8)
})
