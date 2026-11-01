/**
 * Generates walkthrough artifacts: PDF, PDF page PNGs, cycle PNG, mobile screenshots.
 * Requires: npm run build && npm run preview (or sets webServer internally via playwright).
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = '/opt/cursor/artifacts'

async function main() {
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    locale: 'pt-BR',
    viewport: { width: 390, height: 844 },
    acceptDownloads: true,
  })

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] })
  })

  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByTestId('onboarding-skip').click()

  await page.goto('http://127.0.0.1:4173/settings')
  await page.getByTestId('language-select').getByRole('radio', { name: /PT/i }).click()
  await page.getByTestId('path-switcher-trigger').click()
  await page.getByTestId('path-switcher-select').selectOption('path-1')
  await page.getByTestId('path-switcher-confirm').click()

  await page.evaluate(() => {
    const key = 'droid-tycoon-companion-store'
    const raw = localStorage.getItem(key)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const state = parsed.state ?? parsed
    state.progress = state.progress ?? {}
    state.settings = state.settings ?? {}
    state.progress.pathId = 'path-1'
    state.progress.nextRebirth = 13
    state.progress.completedOnPath = 12
    state.settings.locale = 'pt-BR'
    state.settings.localeSource = 'user'
    if (parsed.state) parsed.state = state
    localStorage.setItem(key, JSON.stringify(parsed.state ? parsed : state))
  })
  await page.reload()

  const pdfDownload = page.waitForEvent('download', { timeout: 120000 })
  await page.goto('http://127.0.0.1:4173/progress')
  await page.getByTestId('export-cycle-pdf').click()
  const pdfPath = path.join(outDir, 'ciclo-path1-pt.pdf')
  await (await pdfDownload).saveAs(pdfPath)

  const pngDownload = page.waitForEvent('download', { timeout: 120000 })
  await page.getByTestId('export-cycle-png').click()
  const pngDl = await pngDownload
  await pngDl.saveAs(path.join(outDir, 'ciclo-path1-pt-chunk1.png'))

  await page.screenshot({ path: path.join(outDir, 'progress-sell-list-mobile.png'), fullPage: true })
  await page.goto('http://127.0.0.1:4173/sell')
  await page.screenshot({ path: path.join(outDir, 'sell-center-mobile.png'), fullPage: true })

  try {
    const { execFileSync } = await import('node:child_process')
    execFileSync(
      'pdftoppm',
      ['-png', '-f', '1', '-l', '2', '-r', '144', pdfPath, path.join(outDir, 'page')],
      { stdio: 'pipe' },
    )
    for (const pageNum of [1, 2]) {
      const generated = path.join(outDir, `page-${pageNum}.png`)
      const target = path.join(outDir, `page${pageNum}.png`)
      if (fs.existsSync(generated)) fs.renameSync(generated, target)
    }
  } catch (e) {
    console.warn('PDF page raster skipped:', e.message)
  }

  await browser.close()
  console.log('Artifacts written to', outDir)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
