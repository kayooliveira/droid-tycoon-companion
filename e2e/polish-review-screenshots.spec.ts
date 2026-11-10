import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/polish-review-390x844'

async function seed(page: import('@playwright/test').Page, theme: 'dark' | 'light') {
  await page.goto('/')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState(theme) },
  )
  await page.reload()
}

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
})

for (const theme of ['dark', 'light'] as const) {
  test(`polish review screenshots ${theme}`, async ({ page }) => {
    await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
    await page.setViewportSize({ width: 390, height: 844 })
    await seed(page, theme)

    await page.goto('/progress')
    await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
    await page.getByTestId('progress-actions').scrollIntoViewIfNeeded()
    await page.screenshot({
      path: path.join(ARTIFACTS, `progresso-actions-${theme}-390x844.png`),
      fullPage: false,
    })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({
      path: path.join(ARTIFACTS, `progresso-top-${theme}-390x844.png`),
      fullPage: false,
    })

    await page.goto('/settings')
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 20_000 })
    await page.getByTestId('mobile-more-nav').click()
    await expect(page.getByTestId('nav-more-menu')).toBeVisible()
    await page.screenshot({
      path: path.join(ARTIFACTS, `mais-sheet-open-${theme}-390x844.png`),
      fullPage: false,
    })
    await page.getByTestId('nav-more-menu-close').click()

    await page.goto('/fusion')
    await expect(page.getByTestId('fusion-page')).toBeVisible({ timeout: 20_000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, `fusao-${theme}-390x844.png`),
      fullPage: false,
    })

    await page.goto('/sell')
    await expect(page.getByTestId('sell-page')).toBeVisible({ timeout: 20_000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, `vender-${theme}-390x844.png`),
      fullPage: false,
    })
  })
}
