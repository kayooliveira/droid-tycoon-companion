import { test } from '@playwright/test'

async function skipOnboardingPt(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.getByTestId('onboarding-skip').click()
  await page.waitForTimeout(400)
}

test('capture PR screenshots pt-BR', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR' })
  const page = await context.newPage()
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await skipOnboardingPt(page)

  const shots: Array<{ path: string; fn: () => Promise<void> }> = [
    {
      path: 'docs/screenshots/v2-dashboard-desktop-pt.png',
      fn: async () => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/')
        await page.waitForTimeout(500)
      },
    },
    {
      path: 'docs/screenshots/v2-dashboard-mobile-pt.png',
      fn: async () => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto('/')
        await page.waitForTimeout(500)
      },
    },
    {
      path: 'docs/screenshots/v2-fusion-desktop-pt.png',
      fn: async () => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/fusion')
        await page.waitForTimeout(500)
      },
    },
    {
      path: 'docs/screenshots/v2-progress-desktop-pt.png',
      fn: async () => {
        await page.goto('/progress')
        await page.waitForTimeout(500)
      },
    },
  ]

  for (const s of shots) {
    await s.fn()
    await page.screenshot({ path: s.path, fullPage: true })
  }
  await context.close()
})
