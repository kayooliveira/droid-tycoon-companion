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

const tabTestId = (path: string) =>
  path === '/' ? 'mobile-nav-home' : `mobile-nav-${path.slice(1)}`

async function clickTabAtCoordinates(page: import('@playwright/test').Page, testId: string) {
  const locator = page.getByTestId(testId)
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  expect(box).toBeTruthy()
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
}

test('mobile tab bar navigates reliably under rapid taps', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page)

  for (const start of TABS) {
    await page.goto(start.path)
    await expect(page.getByTestId(start.hub)).toBeVisible({ timeout: 20_000 })

    for (let round = 0; round < 2; round++) {
      for (const tab of TABS) {
        await clickTabAtCoordinates(page, tabTestId(tab.path))
        if (tab.path === '/') {
          await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
        } else {
          await expect(page).toHaveURL(new RegExp(`${tab.path}(\\?|$)`), { timeout: 10_000 })
        }
        await expect(page.getByTestId(tab.hub)).toBeVisible({ timeout: 15_000 })
      }
    }

    await clickTabAtCoordinates(page, 'mobile-nav-home')
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
    await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 15_000 })
  }
})

test('tab bar navigates while Mais sheet is open', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page)

  const tabsWithSheetOpen = [
    { path: '/progress', hub: 'progress-page' },
    { path: '/inventory', hub: 'inventory-page' },
    { path: '/cycles', hub: 'cycles-page' },
  ] as const

  for (const tab of tabsWithSheetOpen) {
    await page.goto('/inventory')
    await page.getByTestId('mobile-more-nav').click()
    await expect(page.getByTestId('nav-more-modal')).toBeVisible()

    await clickTabAtCoordinates(page, tabTestId(tab.path))
    await expect(page.getByTestId('nav-more-modal')).toHaveCount(0, { timeout: 8000 })
    await expect(page).not.toHaveURL(/\/settings/)
    await expect(page).toHaveURL(new RegExp(`${tab.path}(\\?|$)`), { timeout: 10_000 })
    await expect(page.getByTestId(tab.hub)).toBeVisible({ timeout: 15_000 })
  }

  await page.goto('/cycles')
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-modal')).toBeVisible()
  await clickTabAtCoordinates(page, 'mobile-nav-home')
  await expect(page.getByTestId('nav-more-modal')).toHaveCount(0, { timeout: 8000 })
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('home-hub')).toBeVisible()

  await page.goto('/inventory')
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-modal')).toBeVisible()
  const moreBox = await page.getByTestId('mobile-more-nav').boundingBox()
  expect(moreBox).toBeTruthy()
  await page.mouse.click(moreBox!.x + moreBox!.width / 2, moreBox!.y + moreBox!.height / 2)
  await expect(page.getByTestId('nav-more-modal')).toHaveCount(0, { timeout: 8000 })
})
