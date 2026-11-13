import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { buildHeavyInventory, STORE_KEY } from './overflowHelpers'
import { collectHorizontalOverflow } from './overflowHelpers'

const ARTIFACTS = '/opt/cursor/artifacts/busca-v1'

const THEME_MODE: Array<[string, 'dark' | 'light']> = [
  ['oficina', 'dark'],
  ['oficina', 'light'],
  ['figurinhas', 'dark'],
  ['figurinhas', 'light'],
  ['cartaz', 'dark'],
  ['cartaz', 'light'],
]

const WIDTHS = [360, 390] as const

type SearchState = 'vazia' | 'digitando' | 'selecionado' | 'sem-resultado' | 'teclado'

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

async function assertNoOverflow(page: Page, viewportWidth: number) {
  const result = await collectHorizontalOverflow(page)
  expect(
    result.documentScrollWidth,
    `scrollWidth ${result.documentScrollWidth} > ${viewportWidth}`,
  ).toBeLessThanOrEqual(viewportWidth + 1)
  expect(result.issues.slice(0, 3)).toEqual([])
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(ARTIFACTS, name), fullPage: false })
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
  if (state === 'sem-resultado') {
    await input.fill('zzz')
    await expect(page.getByTestId('progress-droid-search-empty')).toBeVisible({ timeout: 8000 })
  }
}

test.beforeAll(() => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
})

for (const [theme, mode] of THEME_MODE) {
  for (const width of WIDTHS) {
    for (const state of ['vazia', 'digitando', 'selecionado', 'sem-resultado'] as const) {
      test(`busca ${theme} ${mode} ${width} ${state}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 })
        await openProgress(page, theme, mode)
        await setSearchState(page, state)
        await assertNoOverflow(page, width)
        await shot(page, `${theme}-${mode}-${width}-${state}.png`)
      })
    }

    test(`busca ${theme} ${mode} ${width} teclado`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await openProgress(page, theme, mode)
      await setSearchState(page, 'digitando')
      await page.evaluate(() => {
        const vv = window.visualViewport
        if (!vv) return
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })
        Object.defineProperty(vv, 'height', { configurable: true, value: 420 })
        vv.dispatchEvent(new Event('resize'))
      })
      await page.getByTestId('progress-droid-search-input').focus()
      await page.waitForTimeout(200)
      const tabHidden = await page.evaluate(() => {
        const nav = document.querySelector('[data-testid="mobile-floating-nav"]')
        if (!nav) return true
        return window.getComputedStyle(nav).display === 'none'
      })
      expect(tabHidden).toBe(true)
      await assertNoOverflow(page, width)
      await shot(page, `${theme}-${mode}-${width}-teclado.png`)
    })
  }
}
