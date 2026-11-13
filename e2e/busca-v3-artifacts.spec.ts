import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { buildHeavyInventory, collectHorizontalOverflow, STORE_KEY } from './overflowHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/busca-v3'
const STORE_ARTIFACTS = '/cursor/stores/self/busca-v3'

const THEME_MODE: Array<[string, 'dark' | 'light']> = [
  ['oficina', 'dark'],
  ['oficina', 'light'],
  ['figurinhas', 'dark'],
  ['figurinhas', 'light'],
  ['cartaz', 'dark'],
  ['cartaz', 'light'],
]

const WIDTHS = [360, 390] as const

type SearchState = 'vazia' | 'digitando' | 'teclado' | 'selecionado' | 'no-seu' | 'sem-resultado'

async function seedProgress(page: Page, theme: string, mode: 'dark' | 'light') {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.clear()
      try {
        sessionStorage.setItem('dd-e2e-skip-onboarding', '1')
      } catch {
        /* ignore */
      }
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    {
      key: STORE_KEY,
      state: {
        schemaVersion: 3,
        onboardingComplete: true,
        progress: { pathId: 'path-5', nextRebirth: 23, completedOnPath: 22 },
        inventory: buildHeavyInventory(),
        settings: {
          locale: 'pt-BR',
          localeSource: 'user',
          theme: mode,
          appearanceTheme: theme,
          appearanceMode: mode,
          trackInventory: true,
          animationsEnabled: false,
          disputedPreference: {},
          installBannerDismissed: true,
          iosInstallHintDismissed: true,
          progressListAllExpanded: true,
        },
        lastSavedAt: new Date().toISOString(),
      },
    },
  )
}

async function openProgress(page: Page, theme: string, mode: 'dark' | 'light') {
  await seedProgress(page, theme, mode)
  await page.goto(`/progress?theme=${theme}&mode=${mode}&onboarding=skip`, {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await page.waitForTimeout(250)
}

async function overflowReport(page: Page, viewportWidth: number) {
  const result = await collectHorizontalOverflow(page)
  expect(
    result.documentScrollWidth,
    `scrollWidth ${result.documentScrollWidth} > ${viewportWidth}`,
  ).toBeLessThanOrEqual(viewportWidth + 1)
  expect(result.issues.slice(0, 3)).toEqual([])
  return {
    scrollWidth: result.documentScrollWidth,
    clientWidth: viewportWidth,
    overflow: result.documentScrollWidth > viewportWidth,
  }
}

async function shot(page: Page, name: string) {
  const file = path.join(ARTIFACTS, name)
  await page.screenshot({ path: file, fullPage: false })
  fs.copyFileSync(file, path.join(STORE_ARTIFACTS, name))
}

async function setSearchState(page: Page, state: SearchState) {
  const input = page.getByTestId('progress-droid-search-input')
  if (state === 'vazia') {
    await input.fill('')
    return
  }
  if (state === 'digitando' || state === 'teclado') {
    await input.fill('Cycl')
    await expect(page.getByRole('listbox')).toBeVisible({ timeout: 8000 })
    return
  }
  if (state === 'selecionado') {
    await input.fill('Cycl')
    await page.getByTestId('progress-search-pick-cyclens').click({ timeout: 8000 })
    await expect(page.getByTestId('progress-search-next-card')).toBeVisible({ timeout: 8000 })
    return
  }
  if (state === 'no-seu') {
    await input.fill('Cyclo')
    await page.getByTestId('progress-search-pick-cyclo-grav').click({ timeout: 8000 })
    await expect(page.getByTestId('progress-search-next-card')).toBeVisible({ timeout: 8000 })
    return
  }
  if (state === 'sem-resultado') {
    await input.fill('zzz')
    await expect(page.getByTestId('progress-droid-search-empty')).toBeVisible({ timeout: 8000 })
  }
}

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  fs.mkdirSync(STORE_ARTIFACTS, { recursive: true })
})

const overflowLog: Array<Record<string, unknown>> = []

for (const [theme, mode] of THEME_MODE) {
  for (const width of WIDTHS) {
    for (const state of [
      'vazia',
      'digitando',
      'teclado',
      'selecionado',
      'no-seu',
      'sem-resultado',
    ] as const) {
      if (state === 'teclado') continue
      test(`busca v3 ${theme} ${mode} ${width} ${state}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 })
        await openProgress(page, theme, mode)
        await setSearchState(page, state)
        const report = await overflowReport(page, width)
        overflowLog.push({ theme, mode, width, state, ...report })
        await shot(page, `${theme}-${mode}-${width}-${state}.png`)
      })
    }

    test(`busca v3 ${theme} ${mode} ${width} teclado`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await openProgress(page, theme, mode)
      await setSearchState(page, 'digitando')
      await page.getByTestId('progress-droid-search-input').focus()
      await page.evaluate(() => {
        const vv = window.visualViewport
        if (!vv) return
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })
        Object.defineProperty(vv, 'height', { configurable: true, value: 420 })
        vv.dispatchEvent(new Event('resize'))
      })
      await page.waitForTimeout(200)
      const report = await overflowReport(page, width)
      overflowLog.push({ theme, mode, width, state: 'teclado', ...report })
      await shot(page, `${theme}-${mode}-${width}-teclado.png`)
    })
  }
}

test.afterAll(() => {
  const out = path.join(ARTIFACTS, 'overflow-report.json')
  fs.writeFileSync(out, JSON.stringify(overflowLog, null, 2))
  fs.writeFileSync(path.join(STORE_ARTIFACTS, 'overflow-report.json'), JSON.stringify(overflowLog, null, 2))
})

test('regressão dtile: progresso sem busca @390 oficina dark', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openProgress(page, 'oficina', 'dark')
  const tile = page.locator('.item-open .dtile--sm').first()
  await expect(tile).toBeVisible({ timeout: 12_000 })
  const box = await tile.boundingBox()
  expect(box).not.toBeNull()
  if (box) {
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(2)
  }
  const name = 'regressao-progresso-sem-busca-oficina-dark-390.png'
  await shot(page, name)
})

test('regressão dtile: ciclos expandido @390 oficina dark', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedProgress(page, 'oficina', 'dark')
  await page.goto('/cycles?theme=oficina&mode=dark&onboarding=skip', {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  })
  await expect(page.getByTestId('cycles-page')).toBeVisible({ timeout: 25_000 })
  await page.getByTestId('cycles-rebirth-2').click()
  const tile = page.locator('.acc-body .dtile--sm').first()
  await expect(tile).toBeVisible({ timeout: 12_000 })
  const box = await tile.boundingBox()
  expect(box).not.toBeNull()
  if (box) {
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(2)
  }
  await shot(page, 'regressao-ciclos-oficina-dark-390.png')
})

test('regressão dtile: vender @390 oficina dark', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedProgress(page, 'oficina', 'dark')
  await page.goto('/sell?theme=oficina&mode=dark&onboarding=skip', {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  })
  await expect(page.getByTestId('sell-page')).toBeVisible({ timeout: 25_000 })
  const tile = page.locator('.item-open .dtile--sm').first()
  await expect(tile).toBeVisible({ timeout: 12_000 })
  const box = await tile.boundingBox()
  expect(box).not.toBeNull()
  if (box) {
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(2)
  }
  await shot(page, 'regressao-vender-oficina-dark-390.png')
})
