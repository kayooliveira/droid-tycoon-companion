import { expect, test } from '@playwright/test'
import path from 'node:path'
import {
  auditInventoryCards,
  collectHorizontalOverflow,
  seedHeavyStore,
} from './overflowHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/overflow'
const INVENTORY_FIX_ARTIFACTS = '/opt/cursor/artifacts/inventory-fix'

const ROUTES: Array<{ path: string; testId: string; wait?: (page: import('@playwright/test').Page) => Promise<void> }> = [
  { path: '/', testId: 'home-hub' },
  { path: '/progress', testId: 'progress-page' },
  { path: '/cycles', testId: 'cycles-page' },
  { path: '/inventory', testId: 'inventory-page' },
  { path: '/sell', testId: 'sell-page' },
  { path: '/droiddex', testId: 'droiddex-page' },
  { path: '/fusion', testId: 'fusion-page' },
  { path: '/settings', testId: 'settings-page' },
  { path: '/about', testId: 'about-page' },
  {
    path: '/404',
    testId: 'not-found-page',
    wait: async (page) => {
      await expect(page.getByTestId('not-found-page')).toBeVisible()
    },
  },
]

const VIEWPORTS = [
  { label: '360x780', width: 360, height: 780 },
  { label: '390x844', width: 390, height: 844 },
] as const

async function openRoute(
  page: import('@playwright/test').Page,
  route: (typeof ROUTES)[number],
  theme: 'dark' | 'light',
) {
  await seedHeavyStore(page, theme)
  await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  if (theme === 'light') {
    await expect(page.locator('html')).toHaveClass(/theme-light/, { timeout: 10_000 })
  }
  await expect(page.getByTestId(route.testId)).toBeVisible({ timeout: 25_000 })
  if (route.wait) await route.wait(page)
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await page.waitForTimeout(300)
}

test.describe('no horizontal overflow (heavy state)', () => {
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light'] as const) {
      for (const route of ROUTES) {
        test(`${route.path} ${theme} ${vp.label}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height })
          await openRoute(page, route, theme)

          const result = await collectHorizontalOverflow(page)
          expect(
            result.documentScrollWidth,
            `document scrollWidth ${result.documentScrollWidth} > viewport ${result.viewportWidth}`,
          ).toBeLessThanOrEqual(result.viewportWidth + 1)

          expect(
            result.issues,
            result.issues
              .slice(0, 5)
              .map((i) => `${i.path} right=${i.right.toFixed(1)}`)
              .join('; '),
          ).toEqual([])

          if (route.path === '/inventory') {
            const cardIssues = await auditInventoryCards(page)
            expect(
              cardIssues,
              cardIssues.map((i) => `${i.kind}: ${i.detail}`).join('; '),
            ).toEqual([])

            if (vp.width === 360 || vp.width === 390) {
              await page.screenshot({
                path: path.join(
                  INVENTORY_FIX_ARTIFACTS,
                  `inventory-top-${theme}-${vp.width}.png`,
                ),
                fullPage: false,
              })
            }
          }
        })
      }
    }
  }
})
