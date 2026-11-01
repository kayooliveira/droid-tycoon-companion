import { test } from '@playwright/test'
import path from 'node:path'

test('capture share menu for artifacts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await page.getByTestId('onboarding-skip').click()
  await page.goto('/')
  await page.getByTestId('share-menu').scrollIntoViewIfNeeded()
  await page.getByTestId('share-menu').screenshot({
    path: path.join('/opt/cursor/artifacts', 'rodada3-mobile-share-card-ui.png'),
  })
})
