import { test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ARTIFACTS =
  process.env.UX_ARTIFACTS_DIR ?? path.join(process.cwd(), 'docs/ux-round-screenshots')

async function seedPtBr(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate(() => {
    localStorage.clear()
    const seed = {
      state: {
        schemaVersion: 2,
        onboardingComplete: false,
        settings: {
          locale: 'pt-BR',
          localeSource: 'user',
          theme: 'system',
          trackInventory: true,
          animationsEnabled: true,
          disputedPreference: {},
          installBannerDismissed: false,
          iosInstallHintDismissed: false,
        },
        progress: {
          pathId: 'path-1',
          nextRebirth: 1,
          completedOnPath: 0,
        },
        inventory: [],
        lastSavedAt: new Date().toISOString(),
      },
      version: 0,
    }
    localStorage.setItem('droid-tycoon-companion-store', JSON.stringify(seed))
  })
  await page.reload()
  await page.waitForTimeout(250)
}

async function writeIconArtifacts() {
  const publicDir = path.join(process.cwd(), 'public')
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await fs.promises.copyFile(path.join(publicDir, 'pwa-512.png'), path.join(ARTIFACTS, 'icon-512.png'))

  const size = 512
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  )
  const masked = await sharp(path.join(publicDir, 'pwa-512-maskable.png'))
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
  await sharp({
    create: {
      width: size + 80,
      height: size + 80,
      channels: 4,
      background: { r: 12, g: 18, b: 28, alpha: 1 },
    },
  })
    .composite([{ input: masked, gravity: 'center' }])
    .png()
    .toFile(path.join(ARTIFACTS, 'icon-maskable-preview.png'))
}

test('ux round screenshots (pt-BR artifacts)', async ({ page, browser }) => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await writeIconArtifacts()

  await page.setViewportSize({ width: 390, height: 844 })
  await seedPtBr(page)

  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-1.png') })
  await page.getByTestId('onboarding-start').click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-2.png') })
  await page.getByTestId('onboarding-next').click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-3.png') })
  await page.getByTestId('onboarding-next').click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: path.join(ARTIFACTS, 'onboarding-4.png') })
  await page.getByTestId('onboarding-finish').click()
  await page.waitForTimeout(400)

  const routes = [
    { file: 'dashboard.png', path: '/' },
    { file: 'progresso.png', path: '/progress' },
    { file: 'inventario.png', path: '/inventory' },
    { file: 'vender.png', path: '/sell' },
    { file: 'ajustes.png', path: '/settings' },
  ] as const

  for (const r of routes) {
    await page.goto(r.path)
    await page.waitForTimeout(350)
    await page.screenshot({ path: path.join(ARTIFACTS, r.file), fullPage: true })
  }

  await page.goto('/progress')
  await page.getByRole('heading', { name: /Rebirth #/i }).first().waitFor({ timeout: 10000 })
  const moreBtn = page.getByRole('button', { name: 'Mais ações' })
  await moreBtn.waitFor({ state: 'visible', timeout: 10000 })
  await moreBtn.click()
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 })
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(ARTIFACTS, 'bottom-sheet.png') })

  const desktop = await browser.newPage()
  await desktop.setViewportSize({ width: 1280, height: 800 })
  await seedPtBr(desktop)
  await desktop.screenshot({ path: path.join(ARTIFACTS, 'onboarding-desktop.png'), fullPage: false })
  await desktop.close()
})
