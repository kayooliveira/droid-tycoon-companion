import { test, expect } from '@playwright/test'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

test('Mais scrim stops above tab bar on Progresso', async ({ page }) => {
  await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState('dark') },
  )
  await page.goto('/progress')
  await expect(page.getByTestId('progress-unified-group')).toBeVisible({ timeout: 25_000 })
  await page.getByTestId('mobile-more-nav').click()
  await expect(page.getByTestId('nav-more-menu-backdrop')).toBeVisible()

  const scrimAboveTabBar = await page.evaluate(() => {
    const scrim = document.querySelector('[data-testid="nav-more-menu-backdrop"]')
    const tab = document.querySelector('.tabbar')
    if (!scrim || !tab) return false
    const scrimRect = scrim.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()
    return scrimRect.bottom <= tabRect.top + 2
  })

  expect(scrimAboveTabBar).toBe(true)
})
