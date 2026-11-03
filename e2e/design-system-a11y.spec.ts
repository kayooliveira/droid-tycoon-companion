import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function openDesignComponents(page: import('@playwright/test').Page, theme: 'dark' | 'light') {
  await page.goto('/design', { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.getByTestId('design-system-page')).toBeVisible({ timeout: 15_000 })
  const toggle =
    theme === 'light'
      ? page.getByTestId('design-theme-light')
      : page.getByTestId('design-theme-dark')
  await toggle.click()
  if (theme === 'light') {
    await expect(page.locator('html.theme-light')).toHaveClass(/theme-light/)
  }
  await expect(page.getByTestId('design-section-components')).toBeVisible()
  if (theme === 'light') {
    await expect(page.locator('html')).toHaveClass(/theme-light/, { timeout: 15_000 })
    await expect(page.locator('.ui-list-row').first()).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
      { timeout: 15_000 },
    )
  } else {
    await expect(page.locator('html')).not.toHaveClass(/theme-light/)
  }
}

test.describe('design system catalog contrast', () => {
  test('components section passes color-contrast in dark and light', async ({ page }) => {
    for (const theme of ['dark', 'light'] as const) {
      await page.goto('about:blank')
      await openDesignComponents(page, theme)
      await expect(page.getByTestId('design-section-components')).toBeVisible()
      const results = await new AxeBuilder({ page })
        .include('[data-testid="design-section-components"]')
        .withRules(['color-contrast'])
        .analyze()
      const violations = results.violations.filter((v) => v.id === 'color-contrast')
      expect(violations, `${theme}: ${JSON.stringify(violations, null, 2)}`).toEqual([])
    }
  })
})
