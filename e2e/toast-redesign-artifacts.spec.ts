import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/toast-redesign-390x844'

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
  test(`toast redesign artifacts ${theme}`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
    await page.setViewportSize({ width: 390, height: 844 })
    await seed(page, theme)

    await page.goto('/progress')
    await expect(page.getByTestId('progress-unified-group')).toBeVisible({ timeout: 25_000 })
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible()
    await page.screenshot({
      path: path.join(ARTIFACTS, `progresso-plus-toast-${theme}-390x844.png`),
      fullPage: false,
    })

    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pwa-updated')))
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 5000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, `toast-info-${theme}-390x844.png`),
      fullPage: false,
    })

    await page.goto('/settings')
    await page.getByTestId('settings-reset-trigger').click()
    const resetConfirm = page.getByTestId('settings-reset-confirm')
    await resetConfirm.scrollIntoViewIfNeeded()
    await resetConfirm.click({ timeout: 15_000 })
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 8000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, `toast-warning-${theme}-390x844.png`),
      fullPage: false,
    })

    await seed(page, theme)
    await page.goto('/settings')
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByTestId('settings-import-trigger').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('not-json'),
    })
    await expect(page.getByTestId('toast-item').first()).toBeVisible({ timeout: 8000 })
    await page.screenshot({
      path: path.join(ARTIFACTS, `toast-error-${theme}-390x844.png`),
      fullPage: false,
    })

    await seed(page, theme)
    await page.goto('/progress')
    await page.getByTestId('requirement-inventory-add').first().click()
    await expect(page.getByTestId('toast-item')).toBeVisible()
    await page.getByTestId('progress-droid-row-open').first().click()
    await expect(page.getByTestId('droid-detail-sheet')).toBeVisible()
    await page.screenshot({
      path: path.join(ARTIFACTS, `sheet-with-toast-${theme}-390x844.png`),
      fullPage: false,
    })
  })
}
