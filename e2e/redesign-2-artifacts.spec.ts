import { expect, test } from '@playwright/test'
import path from 'node:path'
import { openAppScreenSettled } from './appScreenHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/redesign-2'
const VIEWPORT = { width: 390, height: 844 }

const SCREENS: Array<{ slug: string; path: string; testId: string; setup?: (page: import('@playwright/test').Page) => Promise<void> }> = [
  { slug: 'home', path: '/', testId: 'home-hub' },
  { slug: 'progress', path: '/progress', testId: 'progress-page' },
  { slug: 'cycles', path: '/cycles', testId: 'cycles-page' },
  { slug: 'inventory', path: '/inventory', testId: 'inventory-page' },
  { slug: 'sell', path: '/sell', testId: 'sell-page' },
  { slug: 'about', path: '/about', testId: 'about-page' },
  { slug: 'settings', path: '/settings', testId: 'settings-page' },
  { slug: 'droiddex', path: '/droiddex', testId: 'droiddex-page' },
  { slug: 'fusion', path: '/fusion', testId: 'fusion-page' },
  {
    slug: 'not-found',
    path: '/404',
    testId: 'not-found-page',
    setup: async (page) => {
      await expect(page.getByTestId('not-found-page')).toBeVisible()
    },
  },
]

test.describe('redesign 2 screen artifacts (pt-BR)', () => {
  test.use({ viewport: VIEWPORT })

  for (const theme of ['dark', 'light'] as const) {
    for (const screen of SCREENS) {
      test(`${screen.slug} ${theme}`, async ({ page }) => {
        await openAppScreenSettled(page, screen.path, screen.testId, theme, 'pt-BR')
        if (screen.setup) await screen.setup(page)
        await page.screenshot({
          path: path.join(ARTIFACTS, `${screen.slug}-${theme}.png`),
          fullPage: true,
        })
      })
    }
  }

  for (const theme of ['dark', 'light'] as const) {
    test(`after home ${theme}`, async ({ page }) => {
      await openAppScreenSettled(page, '/', 'home-hub', theme, 'pt-BR')
      await page.screenshot({
        path: path.join(ARTIFACTS, `after-home-${theme}.png`),
        fullPage: true,
      })
    })

    test(`after progress ${theme}`, async ({ page }) => {
      await openAppScreenSettled(page, '/progress', 'progress-page', theme, 'pt-BR')
      await page.screenshot({
        path: path.join(ARTIFACTS, `after-progress-${theme}.png`),
        fullPage: true,
      })
    })
  }
})
