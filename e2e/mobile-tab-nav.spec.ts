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

test('Mais sheet paints above Progresso content at hit-test points', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page)
  await page.goto('/progress')
  await expect(page.getByTestId('progress-unified-group')).toBeVisible({ timeout: 25_000 })
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-menu')).toBeVisible()

  const hitTest = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="nav-more-menu"].sheet') as HTMLElement | null
    const scrim = document.querySelector('[data-testid="nav-more-menu-backdrop"]')
    if (!panel || !scrim) return { ok: false, reason: 'missing-nodes' }

    const panelRect = panel.getBoundingClientRect()
    const panelPoints = [
      { x: panelRect.left + panelRect.width * 0.5, y: panelRect.top + 28 },
      { x: panelRect.left + 40, y: panelRect.top + 72 },
      { x: panelRect.left + panelRect.width - 40, y: panelRect.top + 120 },
    ]
    for (const p of panelPoints) {
      const el = document.elementFromPoint(p.x, p.y)
      if (!el || !panel.contains(el)) {
        return { ok: false, reason: 'panel', x: p.x, y: p.y, tag: el?.tagName ?? null }
      }
    }

    const scrimRect = scrim.getBoundingClientRect()
    const scrimPoints = [
      { x: scrimRect.left + 24, y: scrimRect.top + 100 },
      { x: scrimRect.left + scrimRect.width * 0.5, y: scrimRect.top + 220 },
      { x: scrimRect.right - 24, y: scrimRect.top + 160 },
    ]
    for (const p of scrimPoints) {
      const el = document.elementFromPoint(p.x, p.y)
      if (!el || (el !== scrim && !scrim.contains(el))) {
        return { ok: false, reason: 'scrim', x: p.x, y: p.y, tag: el?.tagName ?? null }
      }
    }

    return { ok: true as const }
  })

  expect(hitTest.ok, JSON.stringify(hitTest)).toBe(true)
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
    await expect(page.getByTestId('nav-more-menu')).toBeVisible()

    const viewport = page.viewportSize()!
    const scrimBox = await page.getByTestId('nav-more-menu-backdrop').boundingBox()
    expect(scrimBox).toBeTruthy()
    expect(scrimBox!.y).toBeLessThanOrEqual(1)
    expect(scrimBox!.height).toBeGreaterThanOrEqual(viewport.height - 1)

    await clickTabAtCoordinates(page, tabTestId(tab.path))
    await expect(page.getByTestId('nav-more-menu')).toHaveCount(0, { timeout: 8000 })
    await expect(page).not.toHaveURL(/\/settings/)
    await expect(page).toHaveURL(new RegExp(`${tab.path}(\\?|$)`), { timeout: 10_000 })
    await expect(page.getByTestId(tab.hub)).toBeVisible({ timeout: 15_000 })
  }

  await page.goto('/cycles')
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-menu')).toBeVisible()
  await clickTabAtCoordinates(page, 'mobile-nav-home')
  await expect(page.getByTestId('nav-more-menu')).toHaveCount(0, { timeout: 8000 })
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('home-hub')).toBeVisible()

  await page.goto('/inventory')
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-menu')).toBeVisible()
  const moreBox = await page.getByTestId('mobile-more-nav').boundingBox()
  expect(moreBox).toBeTruthy()
  await page.mouse.click(moreBox!.x + moreBox!.width / 2, moreBox!.y + moreBox!.height / 2)
  await expect(page.getByTestId('nav-more-menu')).toHaveCount(0, { timeout: 8000 })
})
