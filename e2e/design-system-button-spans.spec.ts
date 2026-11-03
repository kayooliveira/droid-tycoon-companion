import { expect, test } from '@playwright/test'
import { openDesignCatalogSettled } from './designSystemHelpers'

test.describe('design system button inner spans', () => {
  test('secondary and segment labels have transparent span backgrounds (light)', async ({
    page,
  }) => {
    await openDesignCatalogSettled(page, 'light', 'pt-BR')
    for (const sel of [
      'button.ui-btn-secondary .truncate',
      'button.ui-segment-active .text-pretty',
      'button.ui-btn-ghost .truncate',
    ]) {
      await expect(page.locator(sel).first()).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      )
    }
  })
})
