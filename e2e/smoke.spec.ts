import { test, expect } from '@playwright/test'

test('onboarding and dashboard smoke', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await expect(page.getByTestId('onboarding-skip')).toBeVisible({ timeout: 15000 })
  await page.getByTestId('onboarding-skip').click()
  await expect(page.getByRole('heading', { name: /Dashboard|Início/i }).first()).toBeVisible({
    timeout: 10000,
  })
  await page.goto('/fusion')
  await expect(page.getByText(/Three of the same droid|Três droids iguais/i)).toBeVisible({
    timeout: 10000,
  })
})

test('path switcher updates path', async ({ page }) => {
  await page.goto('/onboarding')
  await page.getByTestId('onboarding-skip').click()
  await page.getByTestId('path-switcher-trigger').click()
  await page.getByTestId('path-switcher-select').selectOption('path-3')
  await page.getByTestId('path-switcher-confirm').click()
  await page.goto('/settings')
  await expect(page.getByTestId('path-switcher-trigger')).toContainText(/Path 3|Ciclo 3|path-3/i)
})

test('pt-BR locale via browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR' })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] })
  })
  const page = await context.newPage()
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByTestId('onboarding-skip').click()
  await expect(page.getByText('Próximo passo')).toBeVisible({ timeout: 15000 })
  await context.close()
})
