import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/redesign-1b'
const VIEWPORT = { width: 390, height: 844 }

async function openDesign(page: Page, theme: 'dark' | 'light') {
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
}

test.describe('redesign 1b design system artifacts', () => {
  test.use({ viewport: VIEWPORT })

  test('dark design catalog', async ({ page }) => {
    await openDesign(page, 'dark')
    await page.screenshot({
      path: path.join(ARTIFACTS, 'design-system-dark.png'),
      fullPage: true,
    })
    await page.getByTestId('design-section-components').screenshot({
      path: path.join(ARTIFACTS, 'design-components-dark.png'),
    })
  })

  test('light design catalog', async ({ page }) => {
    await openDesign(page, 'light')
    await page.screenshot({
      path: path.join(ARTIFACTS, 'design-system-light.png'),
      fullPage: true,
    })
    await page.getByTestId('design-section-components').screenshot({
      path: path.join(ARTIFACTS, 'design-components-light.png'),
    })
  })
})
