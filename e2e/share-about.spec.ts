import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/onboarding')
  await page.getByTestId('onboarding-skip').click()
})

test('share menu visible on dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => localStorage.setItem('dt-helper-dashboard-seen', '1'))
  await page.goto('/')
  await expect(page.getByTestId('dashboard-ready')).toBeVisible()
  await page.getByTestId('share-export-card').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('share-export-card')).toBeVisible()
  await expect(page.getByTestId('share-app')).toBeVisible()
  await expect(page.getByTestId('share-progress-card')).toBeVisible()
})

test('about page loads', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { name: /About|Sobre/i })).toBeVisible()
})
