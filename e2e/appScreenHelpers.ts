import { expect, type Page } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

export async function seedOnboardedApp(
  page: Page,
  opts: {
    theme: 'dark' | 'light'
    locale?: 'pt-BR' | 'en'
  },
) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, theme, locale }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 2,
            onboardingComplete: true,
            progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
            inventory: [
              { id: 'u1', droidId: 'a-lt', tier: 'default', quantity: 2 },
              { id: 'u2', droidId: 'c-pd', tier: 'gold', quantity: 1 },
            ],
            settings: {
              locale,
              localeSource: 'user',
              theme,
              trackInventory: true,
              animationsEnabled: false,
              disputedPreference: {},
              installBannerDismissed: true,
              iosInstallHintDismissed: true,
            },
            lastSavedAt: new Date().toISOString(),
          },
          version: 0,
        }),
      )
    },
    { key: STORE_KEY, theme: opts.theme, locale: opts.locale ?? 'pt-BR' },
  )
}

export async function waitForMainImages(page: Page, maxImages = 32) {
  await page
    .waitForFunction(
      (max) => {
        const imgs = [...document.querySelectorAll('main img[src]')].slice(0, max) as HTMLImageElement[]
        if (imgs.length === 0) return true
        return imgs.every((img) => img.complete && img.naturalWidth > 0)
      },
      maxImages,
      { timeout: 8000 },
    )
    .catch(() => undefined)
}

/** Loaded route with theme/locale from store; stable for screenshots. */
export async function openAppScreenSettled(
  page: Page,
  path: string,
  readyTestId: string,
  theme: 'dark' | 'light',
  locale: 'pt-BR' | 'en' = 'pt-BR',
) {
  await seedOnboardedApp(page, { theme, locale })
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByTestId(readyTestId)).toBeVisible({ timeout: 25_000 })

  if (theme === 'light') {
    await expect(page.locator('html')).toHaveClass(/theme-light/, { timeout: 15_000 })
  } else {
    await expect(page.locator('html')).not.toHaveClass(/theme-light/)
  }

  await waitForMainImages(page)

  await page.evaluate(async () => {
    document.documentElement.classList.add('design-capture-ready')
    await document.fonts.ready
  })
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(100)
}
