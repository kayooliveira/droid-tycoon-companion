import { test } from '@playwright/test'
import path from 'node:path'

const BEFORE = path.join(process.cwd(), 'docs/audit-screenshots/before')
const AFTER = path.join(process.cwd(), 'docs/audit-screenshots/after')

async function skipOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.getByTestId('onboarding-skip').click()
  await page.waitForTimeout(300)
}

const routes = [
  { name: 'dashboard', path: '/' },
  { name: 'progress', path: '/progress' },
  { name: 'inventory', path: '/inventory' },
  { name: 'sell', path: '/sell' },
  { name: 'droiddex', path: '/droiddex' },
  { name: 'fusion', path: '/fusion' },
  { name: 'settings', path: '/settings' },
  { name: 'about', path: '/about' },
]

async function capture(page: import('@playwright/test').Page, outDir: string, vp: { tag: string }) {
  for (const r of routes) {
    await page.goto(r.path)
    await page.waitForTimeout(350)
    await page.screenshot({
      path: path.join(outDir, `${vp.tag}-${r.name}.png`),
      fullPage: true,
    })
  }
}

for (const vp of [
  { tag: 'mobile', width: 390, height: 844 },
  { tag: 'desktop', width: 1280, height: 800 },
] as const) {
  test(`audit before ${vp.tag}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await skipOnboarding(page)
    await capture(page, BEFORE, vp)
  })

  test(`audit after ${vp.tag}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await skipOnboarding(page)
    await capture(page, AFTER, vp)
  })
}
