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

async function assertSymmetricGutters(page: Page) {
  const layout = await page.evaluate(() => {
    const vp = window.innerWidth
    const title = document.querySelector('.t-display')?.getBoundingClientRect()
    const probe = document
      .querySelector('.progress-droid-search .field-wrap')
      ?.getBoundingClientRect()
    if (!title || !probe) return null
    return {
      titleL: title.left,
      probeL: probe.left,
      leftGap: probe.left,
      rightGap: vp - probe.right,
    }
  })
  expect(layout, 'missing layout probe').not.toBeNull()
  if (!layout) return
  expect(Math.abs(layout.probeL - layout.titleL)).toBeLessThanOrEqual(1)
  expect(Math.abs(layout.leftGap - layout.rightGap)).toBeLessThanOrEqual(2)
  expect(layout.leftGap).toBeGreaterThanOrEqual(14)
  expect(layout.leftGap).toBeLessThanOrEqual(22)
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
        await assertSymmetricGutters(page)
        await shot(page, `${theme}-${mode}-${width}-${state}.png`)
      })
    }

    test(`busca ${theme} ${mode} ${width} teclado`, async ({ page }) => {
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
      const tabHidden = await page.evaluate(() => {
        const nav = document.querySelector('[data-testid="mobile-floating-nav"]')
        if (!nav) return true
        return window.getComputedStyle(nav).display === 'none'
      })
      expect(tabHidden).toBe(true)
      await assertNoOverflow(page, width)
      await assertSymmetricGutters(page)
      const clearCount = await page.locator('[data-testid="progress-droid-search-clear"]').count()
      expect(clearCount).toBe(1)
      await shot(page, `${theme}-${mode}-${width}-teclado.png`)
    })
  }
}

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
  await shot(page, 'regressao-dtile-progresso-oficina-dark-390-sem-busca.png')
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
  await shot(page, 'regressao-dtile-ciclos-oficina-dark-390-expandido.png')
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
  await shot(page, 'regressao-dtile-vender-oficina-dark-390.png')
})

const CONTRAST_COMBOS: Array<[string, 'dark' | 'light']> = [
  ['oficina', 'dark'],
  ['oficina', 'light'],
  ['figurinhas', 'dark'],
  ['figurinhas', 'light'],
  ['cartaz', 'dark'],
  ['cartaz', 'light'],
]

function parseRgb(css: string): [number, number, number] | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (v: number) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = parseRgb(fg)
  const bgRgb = parseRgb(bg)
  if (!fgRgb || !bgRgb) return null
  const l1 = luminance(fgRgb)
  const l2 = luminance(bgRgb)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

test('busca contraste clear e chevron >= 3:1 (6 temas)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const report: Array<Record<string, unknown>> = []
  for (const [theme, mode] of CONTRAST_COMBOS) {
    await openProgress(page, theme, mode)
    await setSearchState(page, 'selecionado')
    const samples = await page.evaluate(() => {
      const pickBg = (el: Element) => {
        let node: Element | null = el
        while (node) {
          const bg = getComputedStyle(node).backgroundColor
          if (!bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent') return bg
          node = node.parentElement
        }
        return getComputedStyle(document.documentElement).backgroundColor
      }
      const clearBtn = document.querySelector('[data-testid="progress-droid-search-clear"]')
      const chev = document.querySelector('.progress-droid-search .status-tag--next')
      const field = document.querySelector('.progress-search-field .field')
      const resolveBg = (el: Element | null) => {
        if (!el) return null
        const direct = getComputedStyle(el).backgroundColor
        if (direct && !direct.includes('rgba(0, 0, 0, 0)')) return direct
        return pickBg(el)
      }
      const fieldBg = resolveBg(field)
      const sample = (el: Element | null, bg: string | null) =>
        el && bg ? { fg: getComputedStyle(el).color, bg } : null
      const chevBg = chev ? pickBg(chev) : null
      return {
        clear: sample(clearBtn, fieldBg),
        chev: sample(chev, chevBg),
        csFg: getComputedStyle(document.documentElement).getPropertyValue('--cs-fg').trim(),
      }
    })
    const clearRatio = samples.clear ? contrastRatio(samples.clear.fg, samples.clear.bg) : null
    const chevRatio = samples.chev ? contrastRatio(samples.chev.fg, samples.chev.bg) : null
    report.push({
      theme,
      mode,
      csFg: samples.csFg,
      clear: clearRatio != null ? Math.round(clearRatio * 100) / 100 : null,
      statusNext: chevRatio != null ? Math.round(chevRatio * 100) / 100 : null,
    })
    expect(clearRatio, `${theme}-${mode} clear`).toBeGreaterThanOrEqual(3)
    expect(chevRatio, `${theme}-${mode} status tag`).toBeGreaterThanOrEqual(3)
  }
  console.log(`BUSCA_CONTRAST_REPORT ${JSON.stringify(report)}`)
})

test('busca CTA abre renascimento destacado na lista', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openProgress(page, 'oficina', 'dark')
  await page.getByTestId('progress-droid-search-input').fill('Cycl')
  await page.getByTestId('progress-search-pick-cyclens').click({ timeout: 8000 })
  await expect(page.getByTestId('progress-search-next-cta')).toBeVisible({ timeout: 8000 })
  await page.getByTestId('progress-search-next-cta').click()
  await expect(page.getByTestId('progress-rebirth-list')).toBeVisible({ timeout: 12_000 })
  await expect(page.getByTestId('progress-droid-search-input')).toHaveValue('')
  const passo = await page.evaluate(() => {
    const u = new URL(window.location.href)
    return u.searchParams.get('passo')
  })
  expect(passo).toBeTruthy()
  const rebirth = Number(passo)
  expect(rebirth).toBeGreaterThan(0)
  const highlighted = page.locator(`[data-testid="progress-list-item-${rebirth}"][data-highlighted="true"]`)
  await expect(highlighted).toBeVisible({ timeout: 12_000 })
})
