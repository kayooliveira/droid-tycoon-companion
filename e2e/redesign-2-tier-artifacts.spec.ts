import { expect, test } from '@playwright/test'
import path from 'node:path'
import { openDesignCatalogSettled } from './designSystemHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/redesign-2'
const VIEWPORT = { width: 390, height: 844 }

test.describe('redesign 2 tier showcase artifacts', () => {
  test.use({ viewport: VIEWPORT })

  for (const theme of ['dark', 'light'] as const) {
    test(`tier badges crop ${theme}`, async ({ page }) => {
      await openDesignCatalogSettled(page, theme, 'pt-BR')
      const section = page.getByTestId('design-section-tier-showcase')
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      const badges = page.getByTestId('design-tier-badges-row')
      await expect(badges).toBeVisible()
      await badges.screenshot({
        path: path.join(ARTIFACTS, `tier-badges-${theme}.png`),
      })
    })

    test(`tier surfaces grid ${theme}`, async ({ page }) => {
      await openDesignCatalogSettled(page, theme, 'pt-BR')
      const grid = page.getByTestId('design-tier-surfaces-grid')
      await grid.scrollIntoViewIfNeeded()
      await expect(grid).toBeVisible()
      await grid.screenshot({
        path: path.join(ARTIFACTS, `tier-surfaces-${theme}.png`),
      })
    })
  }
})
