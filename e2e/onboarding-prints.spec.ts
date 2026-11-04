import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const OUT = path.join(process.cwd(), 'public/onboarding')

const CAPTURES = [
  { route: '/', file: 'inicio', testId: 'home-hub' },
  { route: '/progress', file: 'progresso', testId: 'progress-page' },
  { route: '/inventory', file: 'inventario', testId: 'inventory-page' },
  { route: '/cycles', file: 'ciclos', testId: 'cycles-page' },
] as const

async function seed(page: import('@playwright/test').Page, theme: 'dark' | 'light') {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState(theme) },
  )
  await page.reload()
  await page.waitForTimeout(200)
}

test('regenerate onboarding device screenshots', async ({ page }) => {
  test.setTimeout(120_000)
  fs.mkdirSync(OUT, { recursive: true })
  await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
  await page.setViewportSize({ width: 390, height: 844 })

  for (const theme of ['dark', 'light'] as const) {
    await seed(page, theme)
    if (theme === 'light') {
      await page.evaluate(() => document.documentElement.classList.add('theme-light'))
    } else {
      await page.evaluate(() => document.documentElement.classList.remove('theme-light'))
    }
    for (const cap of CAPTURES) {
      await page.goto(cap.route)
      await expect(page.getByTestId(cap.testId)).toBeVisible({ timeout: 25_000 })
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      await page.waitForTimeout(350)
      await page.screenshot({
        path: path.join(OUT, `${cap.file}-${theme}.png`),
        fullPage: false,
      })
    }
  }
})
