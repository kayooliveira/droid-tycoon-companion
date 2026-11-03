import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const ARTIFACTS =
  process.env.UX_ARTIFACTS_DIR ?? path.join(process.cwd(), 'artifacts/impl-pr1')

const ROUTES = [
  { path: '/', file: 'inicio', testId: 'home-hub' },
  { path: '/progress', file: 'progresso', testId: 'progress-super-actions' },
  { path: '/inventory', file: 'inventario', testId: 'inventory-page' },
  { path: '/cycles', file: 'ciclos', testId: 'cycles-path-chips' },
  { path: '/sell', file: 'vender', testId: 'sell-center-safe-now' },
  { path: '/settings', file: 'mais-config', testId: 'settings-import-trigger' },
  { path: '/about', file: 'sobre', testId: 'about-credits-footer' },
] as const

async function seed(page: import('@playwright/test').Page, theme: 'dark' | 'light') {
  await page.goto('/')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(
        key,
        JSON.stringify({ state, version: 0 }),
      )
    },
    { key: STORE_KEY, state: heavyAppState(theme) },
  )
  await page.reload()
  await page.waitForTimeout(250)
}

for (const theme of ['dark', 'light'] as const) {
  test(`impl-pr1 screenshots ${theme}`, async ({ page }) => {
    fs.mkdirSync(ARTIFACTS, { recursive: true })
    await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
    await page.setViewportSize({ width: 390, height: 844 })
    await seed(page, theme)
    for (const route of ROUTES) {
      await page.goto(route.path)
      await page.waitForTimeout(400)
      const anchor = page.getByTestId(route.testId)
      if (await anchor.count()) {
        await expect(anchor.first()).toBeVisible({ timeout: 15000 })
      }
      await page.screenshot({
        path: path.join(ARTIFACTS, `${route.file}-${theme}-390x844.png`),
        fullPage: true,
      })
    }
  })
}
