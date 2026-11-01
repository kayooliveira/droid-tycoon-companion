import { test, expect } from '@playwright/test'
import path from 'node:path'

const ART = '/opt/cursor/artifacts'

test('dashboard mobile pt-BR', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR' })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] })
  })
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByTestId('onboarding-skip').click()
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Início' }).first()).toBeVisible({ timeout: 15000 })
  await page.screenshot({ path: path.join(ART, 'dashboard-pt.png'), fullPage: true })
  await context.close()
})

test('share progress card PNG pt-BR', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR', acceptDownloads: true })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
  })
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByTestId('onboarding-skip').click()
  await page.goto('/')
  await page.getByTestId('share-menu').scrollIntoViewIfNeeded()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('share-progress-card').click(),
  ])
  await download.saveAs(path.join(ART, 'share-card-pt.png'))
  await context.close()
})
