import { test, expect } from '@playwright/test'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

async function seedOnboarded(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState('dark') },
  )
  await page.reload()
  await page.goto('/')
  await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 30_000 })
}

test('core shell and PDF export work offline after precache', async ({ page, context }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await seedOnboarded(page)

  for (const route of ['/', '/progress', '/inventory', '/cycles']) {
    await page.goto(route)
    await page.waitForTimeout(250)
  }
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready
    }
  })

  await page.goto('/progress')
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 20_000 })

  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 30_000 })

  const downloadPromise = page.waitForEvent('download', { timeout: 120_000 })
  await page.getByTestId('export-progress-pdf').click()
  const download = await downloadPromise
  expect(download.suggestedFilename().toLowerCase()).toMatch(/\.pdf$/)
  const tmp = await download.path()
  expect(tmp).toBeTruthy()
})

test('PWA update toast appears at top when refresh is needed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedOnboarded(page)
  await page.goto('/')
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('pwa-need-refresh'))
  })
  const toast = page.getByTestId('toast-item').first()
  await expect(toast).toBeVisible({ timeout: 5000 })
  await expect(toast).toHaveAttribute('data-toast-variant', 'info')
  const box = await toast.boundingBox()
  expect(box).toBeTruthy()
  if (box) {
    expect(box.y).toBeLessThan(120)
  }
})
