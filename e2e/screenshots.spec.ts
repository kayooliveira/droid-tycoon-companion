import { test } from '@playwright/test'

test('capture PR screenshots', async ({ page }) => {
  await page.goto('./#/onboarding')
  await page.getByTestId('onboarding-skip').click()
  await page.waitForTimeout(500)

  const shots: Array<{ path: string; fn: () => Promise<void> }> = [
    {
      path: 'docs/screenshots/dashboard-desktop.png',
      fn: async () => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('./#/')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/dashboard-mobile.png',
      fn: async () => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto('./#/')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/progress-desktop.png',
      fn: async () => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('./#/progress')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/sell-desktop.png',
      fn: async () => {
        await page.goto('./#/sell')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/droiddex-desktop.png',
      fn: async () => {
        await page.goto('./#/droiddex')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/fusion-desktop.png',
      fn: async () => {
        await page.goto('./#/fusion')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/inventory-desktop.png',
      fn: async () => {
        await page.goto('./#/inventory')
        await page.waitForTimeout(400)
      },
    },
    {
      path: 'docs/screenshots/settings-desktop.png',
      fn: async () => {
        await page.goto('./#/settings')
        await page.waitForTimeout(400)
      },
    },
  ]

  for (const s of shots) {
    await s.fn()
    await page.screenshot({ path: s.path, fullPage: true })
  }
})
