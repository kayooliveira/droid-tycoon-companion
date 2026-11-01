import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('four-step onboarding completes to dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByTestId('onboarding-start')).toBeVisible({ timeout: 15000 })
  await page.getByTestId('onboarding-start').click()

  await expect(page.getByTestId('onboarding-cycle-path-1')).toBeVisible()
  await page.getByTestId('onboarding-next').click()

  await expect(page.getByTestId('onboarding-rebirth-input')).toBeVisible()
  await page.getByTestId('onboarding-next').click()

  await expect(page.getByTestId('onboarding-finish')).toBeVisible()
  await page.getByTestId('onboarding-finish').click()

  await expect(page.getByRole('heading', { name: /Dashboard|Início/i }).first()).toBeVisible({
    timeout: 10000,
  })
})

test('skip from welcome still reaches dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByTestId('onboarding-skip').first()).toBeVisible({ timeout: 15000 })
  await page.getByTestId('onboarding-skip').first().click()
  await expect(page.getByRole('heading', { name: /Dashboard|Início/i }).first()).toBeVisible({
    timeout: 10000,
  })
})
