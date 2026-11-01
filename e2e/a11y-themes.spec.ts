import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function expectNoSeriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
}

test.describe('theme contrast (axe)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding')
    await page.evaluate(() => localStorage.clear())
    await page.getByTestId('onboarding-skip').click()
  })

  test('settings light theme', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('radio', { name: /Claro|Light/i }).click()
    await page.waitForTimeout(200)
    await expectNoSeriousViolations(page)
  })

  test('settings dark theme', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('radio', { name: /Escuro|Dark/i }).click()
    await page.waitForTimeout(200)
    await expectNoSeriousViolations(page)
  })
})
