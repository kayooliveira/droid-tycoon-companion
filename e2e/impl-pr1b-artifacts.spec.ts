import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { heavyAppState, STORE_KEY } from './overflowHelpers'

const ARTIFACTS = path.join(process.cwd(), 'artifacts/impl-pr1b')
const MOCK_HTML = path.join(process.cwd(), 'e2e/fixtures/direction-c-mock.html')

const ROUTES = [
  { path: '/', file: 'inicio', testId: 'home-hub' },
  { path: '/progress', file: 'progresso', testId: 'progress-page' },
  { path: '/inventory', file: 'inventario', testId: 'inventory-page' },
  { path: '/cycles', file: 'ciclos', testId: 'cycles-page' },
  { path: '/sell', file: 'vender', testId: 'sell-page' },
  { path: '/settings', file: 'mais', testId: 'settings-page' },
  { path: '/about', file: 'sobre', testId: 'about-page' },
] as const

const MOCK_SCREENS = [
  { hash: 'inicio', file: 'inicio' },
  { hash: 'progresso', file: 'progresso' },
  { hash: 'inventario', file: 'inventario' },
] as const

async function seed(page: import('@playwright/test').Page, theme: 'dark' | 'light') {
  await page.goto('/')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState(theme) },
  )
  await page.reload()
  await page.waitForTimeout(250)
}

for (const theme of ['dark', 'light'] as const) {
  test(`impl-pr1b viewport ${theme}`, async ({ page }) => {
    fs.mkdirSync(ARTIFACTS, { recursive: true })
    await page.addInitScript(() => document.documentElement.classList.add('e2e-safe-area'))
    await page.setViewportSize({ width: 390, height: 844 })
    await seed(page, theme)
    for (const route of ROUTES) {
      await page.goto(route.path)
      await page.waitForTimeout(400)
      await expect(page.getByTestId(route.testId)).toBeVisible({ timeout: 20000 })
      await page.screenshot({
        path: path.join(ARTIFACTS, `${route.file}-${theme}-390x844.png`),
        fullPage: false,
      })
    }
  })
}

test('impl-pr1b mock vs app side by side', async ({ page }) => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  if (!fs.existsSync(MOCK_HTML)) {
    test.skip(true, 'Mock HTML not copied to public/')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  for (const theme of ['dark', 'light'] as const) {
    await seed(page, theme)
    if (theme === 'light') {
      await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'light'))
    } else {
      await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'dark'))
    }
    for (const { hash, file } of MOCK_SCREENS) {
      await page.goto(`file://${MOCK_HTML}#${hash}`)
      await page.waitForTimeout(500)
      const mockBuf = await page.screenshot({ fullPage: false })
      const route =
        file === 'inicio' ? '/' : file === 'progresso' ? '/progress' : '/inventory'
      await page.goto(route)
      await page.waitForTimeout(400)
      const appBuf = await page.screenshot({ fullPage: false })
      const mockMeta = await sharp(mockBuf).metadata()
      const w = mockMeta.width ?? 390
      const h = mockMeta.height ?? 844
      const combined = await sharp({
        create: {
          width: w * 2,
          height: h,
          channels: 3,
          background: '#111',
        },
      })
        .composite([
          { input: mockBuf, left: 0, top: 0 },
          { input: appBuf, left: w, top: 0 },
        ])
        .png()
        .toBuffer()
      await fs.promises.writeFile(
        path.join(ARTIFACTS, `compare-${file}-${theme}-390x844.png`),
        combined,
      )
    }
  }
})
