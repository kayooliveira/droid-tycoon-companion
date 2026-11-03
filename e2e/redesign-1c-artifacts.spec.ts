import { expect, test } from '@playwright/test'
import path from 'node:path'
import { openDesignCatalogSettled } from './designSystemHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/redesign-1c'
const VIEWPORT = { width: 390, height: 844 }

test.describe('redesign 1c design system artifacts (pt-BR)', () => {
  test.use({ viewport: VIEWPORT })

  test('dark design catalog', async ({ page }) => {
    await openDesignCatalogSettled(page, 'dark', 'pt-BR')
    await page.screenshot({
      path: path.join(ARTIFACTS, 'design-system-dark.png'),
      fullPage: true,
    })
    await page.getByTestId('design-section-components').screenshot({
      path: path.join(ARTIFACTS, 'design-components-dark.png'),
    })
  })

  test('light design catalog', async ({ page }) => {
    await openDesignCatalogSettled(page, 'light', 'pt-BR')
    await expect(page.getByPlaceholder('Buscar exemplo')).toBeVisible()
    await expect(page.getByText('Nada aqui ainda')).toBeVisible()
    await expect(page.getByText('Ok').first()).toBeVisible()
    await page.screenshot({
      path: path.join(ARTIFACTS, 'design-system-light.png'),
      fullPage: true,
    })
    await page.getByTestId('design-section-components').screenshot({
      path: path.join(ARTIFACTS, 'design-components-light.png'),
    })
  })
})
