import { expect, test } from '@playwright/test'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/redesign-2'
const VIEWPORT = { width: 390, height: 844 }

test.describe('redesign 2 onboarding tier backdrops', () => {
  test.use({ viewport: VIEWPORT })

  for (const theme of ['dark', 'light'] as const) {
    test(`onboarding welcome ${theme}`, async ({ page }) => {
      await page.goto('/onboarding')
      await page.evaluate((themeArg) => {
        document.documentElement.classList.toggle('theme-light', themeArg === 'light')
      }, theme)
      await expect(page.getByTestId('onboarding-step-welcome')).toBeVisible({ timeout: 15_000 })
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      await page.waitForTimeout(400)
      await page.screenshot({
        path: path.join(ARTIFACTS, `onboarding-welcome-${theme}.png`),
        fullPage: true,
      })
    })
  }
})
