import { test, expect } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

const EN_RARITIES = /\b(Common|Rare|Epic|Legendary|Mythic|Iconic)\b/

async function seedPt(page: import('@playwright/test').Page) {
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

test('Droiddex pt-BR shows translated base rarities', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedPt(page)
  await page.goto('/droiddex')
  await page.waitForTimeout(400)

  const main = page.locator('main')
  const text = await main.innerText()
  expect(text).not.toMatch(EN_RARITIES)
  expect(text).toMatch(/Comum|Raro|Épico|Lendário|Mítico|Icônico/)
})
