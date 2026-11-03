import { test, expect } from '@playwright/test'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const TABS = [
  { path: '/', hub: 'home-hub' },
  { path: '/progress', hub: 'progress-page' },
  { path: '/inventory', hub: 'inventory-page' },
  { path: '/cycles', hub: 'cycles-page' },
] as const

async function seed(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState('dark') },
  )
  await page.reload()
  await page.goto('/')
  await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 25_000 })
}

test('mobile tab bar navigates reliably under rapid taps', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page)

  const tabTestId = (path: string) =>
    path === '/' ? 'mobile-nav-home' : `mobile-nav-${path.slice(1)}`

  for (const start of TABS) {
    await page.goto(start.path)
    await expect(page.getByTestId(start.hub)).toBeVisible({ timeout: 20_000 })

    for (let round = 0; round < 2; round++) {
      for (const tab of TABS) {
        await page.getByTestId(tabTestId(tab.path)).click()
        if (tab.path === '/') {
          await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
        } else {
          await expect(page).toHaveURL(new RegExp(`${tab.path}(\\?|$)`), { timeout: 10_000 })
        }
        await expect(page.getByTestId(tab.hub)).toBeVisible({ timeout: 15_000 })
      }
    }

    await page.getByTestId('mobile-nav-home').click()
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
    await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 15_000 })
  }
})

test('tab bar navigates while Mais sheet is open', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page)

  const tabTestId = (path: string) =>
    path === '/' ? 'mobile-nav-home' : `mobile-nav-${path.slice(1)}`

  const tapTab = async (path: string) => {
    const id = tabTestId(path)
    await page.waitForSelector(`[data-testid="${id}"]`, { state: 'attached' })
    await page.evaluate((testId) => {
      const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLButtonElement | null
      el?.click()
    }, id)
  }

  const tabsWithSheetOpen = [
    { path: '/progress', hub: 'progress-page' },
    { path: '/inventory', hub: 'inventory-page' },
    { path: '/cycles', hub: 'cycles-page' },
  ] as const

  for (const tab of tabsWithSheetOpen) {
    await page.goto('/inventory')
    await page.getByTestId('mobile-more-nav').click()
    await expect(page.getByTestId('nav-more-modal')).toBeVisible()

    await tapTab(tab.path)
    await expect(page.getByTestId('nav-more-modal')).toHaveCount(0, { timeout: 8000 })
    await expect(page).not.toHaveURL(/\/settings/)
    await expect(page).toHaveURL(new RegExp(`${tab.path}(\\?|$)`), { timeout: 10_000 })
    await expect(page.getByTestId(tab.hub)).toBeVisible({ timeout: 15_000 })
  }

  await page.goto('/cycles')
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-modal')).toBeVisible()
  await tapTab('/')
  await expect(page.getByTestId('nav-more-modal')).toHaveCount(0, { timeout: 8000 })
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('home-hub')).toBeVisible()

  await page.goto('/inventory')
  const tapMore = () =>
    page.evaluate(() => {
      ;(document.querySelector('[data-testid="mobile-more-nav"]') as HTMLButtonElement | null)?.click()
    })
  await tapMore()
  await expect(page.getByTestId('nav-more-modal')).toBeVisible()
  await tapMore()
  await expect(page.getByTestId('nav-more-modal')).toHaveCount(0, { timeout: 8000 })
})
