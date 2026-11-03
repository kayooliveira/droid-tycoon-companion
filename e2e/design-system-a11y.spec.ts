import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { openDesignCatalogSettled } from './designSystemHelpers'

test.describe('design system catalog contrast', () => {
  test('components section passes color-contrast in dark and light (pt-BR)', async ({ page }) => {
    for (const theme of ['dark', 'light'] as const) {
      await page.goto('about:blank')
      await openDesignCatalogSettled(page, theme, 'pt-BR')
      const results = await new AxeBuilder({ page })
        .include('[data-testid="design-section-components"]')
        .withRules(['color-contrast'])
        .analyze()
      const violations = results.violations.filter((v) => v.id === 'color-contrast')
      expect(violations, `${theme}: ${JSON.stringify(violations, null, 2)}`).toEqual([])
    }
  })
})
