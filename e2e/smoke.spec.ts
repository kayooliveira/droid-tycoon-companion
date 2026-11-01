import { test, expect } from '@playwright/test'

test('onboarding and dashboard smoke', async ({ page }) => {
  await page.goto('./#/onboarding')
  await expect(page.getByTestId('onboarding-skip')).toBeVisible({ timeout: 15000 })
  await page.getByTestId('onboarding-skip').click()
  await expect(page.getByText('Dashboard', { exact: true }).first()).toBeVisible({
    timeout: 10000,
  })
  await page.getByRole('link', { name: 'Droiddex' }).first().click()
  await expect(page.getByRole('heading', { name: 'Droiddex' })).toBeVisible()
})
