import { test, expect } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

const FORBIDDEN_EN = [
  /\bthe\b/i,
  /\bthis\b/i,
  /\brebirth\b/i,
  /\bpath\b/i,
  /\bmissing\b/i,
  /\bsell\b/i,
  /\bcomplete\b/i,
  /\bsettings\b/i,
  /\bdashboard\b/i,
  /\bworking on\b/i,
]

async function seedPtComplete(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        state: {
          schemaVersion: 2,
          onboardingComplete: true,
          progress: { pathId: 'path-1', nextRebirth: 3, completedOnPath: 2 },
          inventory: [],
          settings: {
            locale: 'pt-BR',
            localeSource: 'user',
            theme: 'dark',
            trackInventory: true,
            animationsEnabled: true,
            disputedPreference: {},
            installBannerDismissed: true,
            iosInstallHintDismissed: true,
          },
          lastSavedAt: new Date().toISOString(),
        },
        version: 0,
      }),
    )
  }, STORE_KEY)
  await page.reload()
}

const routes = [
  '/onboarding',
  '/',
  '/progress',
  '/cycles',
  '/inventory',
  '/sell',
  '/droiddex',
  '/fusion',
  '/settings',
  '/about',
]

test.describe('pt-BR DOM English leak audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' })
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] })
    })
  })

  for (const route of routes) {
    test(`no common English UI leaks on ${route}`, async ({ page }) => {
      if (route === '/onboarding') {
        await page.goto('/onboarding')
        await page.evaluate(() => localStorage.clear())
        await page.reload()
        await page.evaluate((key) => {
          const raw = localStorage.getItem(key)
          if (!raw) return
          const parsed = JSON.parse(raw) as { state?: { settings?: { locale?: string } } }
          if (parsed.state?.settings) parsed.state.settings.locale = 'pt-BR'
          localStorage.setItem(key, JSON.stringify(parsed))
        }, STORE_KEY)
      } else {
        await seedPtComplete(page)
        await page.goto(route)
      }

      await page.waitForTimeout(400)
      const text =
        route === '/onboarding'
          ? await page.locator('[data-testid="onboarding-shell"]').innerText()
          : await page.locator('main').innerText()
      const hits: string[] = []
      for (const re of FORBIDDEN_EN) {
        const m = text.match(re)
        if (m) hits.push(`${re}: ${m[0]}`)
      }
      expect(hits, hits.join('\n')).toEqual([])
    })
  }
})
