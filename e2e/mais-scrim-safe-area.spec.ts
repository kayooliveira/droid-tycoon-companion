import { test, expect } from '@playwright/test'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

test('Mais scrim covers bottom safe-area strip on Progresso', async ({ page }) => {
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
  await expect(page.getByTestId('nav-more-modal-scrim')).toBeVisible()

  const scrimCoversBottom = await page.evaluate(() => {
    const scrim = document.querySelector('[data-testid="nav-more-modal-scrim"]')
    if (!scrim) return false
    const rect = scrim.getBoundingClientRect()
    const x = window.innerWidth / 2
    const y = window.innerHeight - 6
    if (y > rect.bottom + 1) return false
    const el = document.elementFromPoint(x, y)
    return el === scrim || scrim.contains(el)
  })

  expect(scrimCoversBottom).toBe(true)
})
