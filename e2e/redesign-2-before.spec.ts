import { test } from '@playwright/test'
import path from 'node:path'
import { openAppScreenSettled } from './appScreenHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/redesign-2/before'
const VIEWPORT = { width: 390, height: 844 }

test.describe('redesign 2 before baseline', () => {
  test.use({ viewport: VIEWPORT })

  for (const theme of ['dark', 'light'] as const) {
    test(`home ${theme}`, async ({ page }) => {
      await openAppScreenSettled(page, '/', 'home-hub', theme, 'pt-BR')
      await page.screenshot({
        path: path.join(ARTIFACTS, `home-${theme}.png`),
        fullPage: true,
      })
    })

    test(`progress ${theme}`, async ({ page }) => {
      await openAppScreenSettled(page, '/progress', 'progress-page', theme, 'pt-BR')
      await page.screenshot({
        path: path.join(ARTIFACTS, `progress-${theme}.png`),
        fullPage: true,
      })
    })
  }
})
