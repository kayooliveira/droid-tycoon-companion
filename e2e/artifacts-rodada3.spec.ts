import { test, expect } from '@playwright/test'
import path from 'node:path'

const ART = '/opt/cursor/artifacts'
const STORE_KEY = 'droid-tycoon-companion-store'

type ProgressSeed = {
  pathId: string
  nextRebirth: number
  completedOnPath: number
  inventory?: Array<{ id: string; droidId: string; tier: string; quantity: number }>
}

async function seedPtBr(page: import('@playwright/test').Page, progress: ProgressSeed) {
  await page.evaluate(
    ({ key, progress }) => {
      const payload = {
        state: {
          schemaVersion: 2,
          onboardingComplete: true,
          progress: {
            pathId: progress.pathId,
            nextRebirth: progress.nextRebirth,
            completedOnPath: progress.completedOnPath,
          },
          inventory: progress.inventory ?? [],
          settings: {
            theme: 'dark',
            animationsEnabled: true,
            trackInventory: true,
            disputedPreference: {},
            locale: 'pt-BR',
            localeSource: 'user',
            installBannerDismissed: true,
            iosInstallHintDismissed: true,
          },
          lastSavedAt: new Date().toISOString(),
        },
        version: 0,
      }
      localStorage.setItem(key, JSON.stringify(payload))
      localStorage.setItem('dt-helper-dashboard-seen', '1')
    },
    { key: STORE_KEY, progress },
  )
  await page.reload()
}

async function openDashboardPt(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('home-now')).toBeVisible()
}

test('dashboard mobile pt-BR', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR' })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] })
  })
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await seedPtBr(page, { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 })
  await openDashboardPt(page)
  await page.screenshot({ path: path.join(ART, 'dashboard-pt.png'), fullPage: true })
  await context.close()
})

async function downloadShareCard(
  page: import('@playwright/test').Page,
  outFile: string,
  progress: ProgressSeed,
) {
  await seedPtBr(page, progress)
  await openDashboardPt(page)
  await page.getByTestId('share-export-card').scrollIntoViewIfNeeded()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('share-progress-card').click(),
  ])
  await download.saveAs(path.join(ART, outFile))
}

test('share card PNG pt-BR zero state', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR', acceptDownloads: true })
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await downloadShareCard(page, 'share-card-pt-zero.png', {
    pathId: 'path-1',
    nextRebirth: 1,
    completedOnPath: 0,
    inventory: [],
  })
  await context.close()
})

test('share card PNG pt-BR rebirth 12', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR', acceptDownloads: true })
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/onboarding')
  await downloadShareCard(page, 'share-card-pt-r12.png', {
    pathId: 'path-1',
    nextRebirth: 13,
    completedOnPath: 12,
    inventory: [
      { id: 'a', droidId: 'cb', tier: 'default', quantity: 1 },
      { id: 'b', droidId: 'pit', tier: 'default', quantity: 1 },
      { id: 'c', droidId: 'drk-1-probe', tier: 'gold', quantity: 1 },
      { id: 'd', droidId: 'gonk', tier: 'default', quantity: 2 },
    ],
  })
  await context.close()
})
