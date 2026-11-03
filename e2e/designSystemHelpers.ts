import { expect, type Page } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

export async function seedDesignCatalogStore(
  page: Page,
  opts: { theme: 'dark' | 'light'; locale?: 'pt-BR' | 'en' },
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
            progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 0 },
            inventory: [],
          },
          version: 0,
        }),
      )
    },
    { key: STORE_KEY, theme: opts.theme, locale: opts.locale ?? 'pt-BR' },
  )
}

/** Open /design with theme + locale from store; wait until paint is stable for screenshots. */
export async function openDesignCatalogSettled(
  page: Page,
  theme: 'dark' | 'light',
  locale: 'pt-BR' | 'en' = 'pt-BR',
) {
  await seedDesignCatalogStore(page, { theme, locale })
  await page.goto('/design', { waitUntil: 'networkidle', timeout: 45_000 })
  await expect(page.getByTestId('design-system-page')).toBeVisible({ timeout: 15_000 })

  if (theme === 'light') {
    await expect(page.locator('html')).toHaveClass(/theme-light/, { timeout: 15_000 })
  } else {
    await expect(page.locator('html')).not.toHaveClass(/theme-light/)
  }

  await expect(page.getByTestId('design-section-components')).toBeVisible()

  const listRow = page.locator('.ui-list-row').first()
  await expect(listRow).toBeVisible()
  if (theme === 'light') {
    await expect(listRow).toHaveCSS('background-color', 'rgb(255, 255, 255)', {
      timeout: 15_000,
    })
  }

  const secondaryLabel = page.locator('button.ui-btn-secondary .truncate').first()
  await expect(secondaryLabel).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)', {
    timeout: 15_000,
  })

  await page.evaluate(async () => {
    document.documentElement.classList.add('design-capture-ready')
    await document.fonts.ready
  })

  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(100)
}
