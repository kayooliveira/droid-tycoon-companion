import { chromium } from '@playwright/test'
import fs from 'node:fs'

const outDir = '/opt/cursor/artifacts'
const base = 'http://127.0.0.1:4173'

const routes = [
  ['dashboard', '/'],
  ['progress', '/progress'],
  ['inventory', '/inventory'],
  ['sell', '/sell'],
  ['droiddex', '/droiddex'],
  ['fusion', '/fusion'],
  ['settings-dark', '/settings'],
  ['about', '/about'],
  ['onboarding', '/onboarding?rerun=1'],
]

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    locale: 'pt-BR',
    viewport: { width: 390, height: 844 },
  })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
  })
  const page = await context.newPage()
  await page.goto(`${base}/onboarding`)
  await page.evaluate(() => localStorage.clear())
  await page.getByTestId('onboarding-skip').click()

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
    localStorage.setItem('dt-helper-dashboard-seen', '1')
  })
  await page.reload()

  for (const [name, path] of routes) {
    await page.goto(`${base}${path}`)
    await page.waitForTimeout(400)
    if (name === 'progress') {
      await page
        .getByTestId('sell-after-list')
        .or(page.getByTestId('sell-after-empty'))
        .scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
    }
    await page.screenshot({ path: `${outDir}/uiux-${name}.png`, fullPage: true })
  }

  await page.goto(`${base}/settings`)
  await page.getByRole('radio', { name: /Claro|Light/i }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/uiux-settings-light.png`, fullPage: true })

  await page.getByRole('radio', { name: /Escuro|Dark/i }).click()
  await page.screenshot({ path: `${outDir}/uiux-settings-dark.png`, fullPage: true })

  await page.goto(`${base}/progress`)
  await page.getByTestId('path-switcher-trigger').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/uiux-modal-path-switch.png`, fullPage: false })

  await browser.close()
  console.log('UIUX artifacts saved to', outDir)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
