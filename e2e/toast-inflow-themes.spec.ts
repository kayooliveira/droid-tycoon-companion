import { test, expect } from '@playwright/test'

const STORE_KEY = 'droid-tycoon-companion-store'

const THEME_MODE: Array<[string, string]> = [
  ['oficina', 'dark'],
  ['oficina', 'light'],
  ['figurinhas', 'dark'],
  ['figurinhas', 'light'],
  ['cartaz', 'dark'],
  ['cartaz', 'light'],
]

const WIDTHS = [360, 390] as const

async function seedProgress(page: import('@playwright/test').Page) {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key }) => {
      localStorage.clear()
      try {
        sessionStorage.setItem('dd-e2e-skip-onboarding', '1')
      } catch {
        /* ignore */
      }
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            schemaVersion: 3,
            onboardingComplete: true,
            progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
            inventory: [],
            settings: {
              locale: 'pt-BR',
              localeSource: 'user',
              theme: 'dark',
              appearanceTheme: 'oficina',
              appearanceMode: 'dark',
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
    { key: STORE_KEY },
  )
}

for (const [theme, mode] of THEME_MODE) {
  for (const width of WIDTHS) {
    test(`in-flow toast placement ${theme} ${mode} @${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await seedProgress(page)
      await page.goto(
        `/progress?theme=${theme}&mode=${mode}&onboarding=skip`,
      )
      await expect(page.getByTestId('progress-page')).toBeVisible({ timeout: 25_000 })
      await page.getByTestId('requirement-inventory-add').first().click()
      await expect(page.getByTestId('toast-item')).toBeVisible({ timeout: 5000 })

      const layout = await page.evaluate(() => {
        const slot = document.querySelector('[data-testid="toast-stack"]')
        const nav = document.querySelector('[data-testid="mobile-floating-nav"]')
        const toast = document.querySelector('[data-testid="toast-item"]')
        if (!slot || !nav || !toast) return null
        const sr = slot.getBoundingClientRect()
        const nr = nav.getBoundingClientRect()
        const tr = toast.getBoundingClientRect()
        const obscured: string[] = []
        document.querySelectorAll('[data-testid="mobile-floating-nav"] .tab').forEach((tab) => {
          const r = tab.getBoundingClientRect()
          const ix = Math.min(r.right, tr.right) - Math.max(r.left, tr.left)
          const iy = Math.min(r.bottom, tr.bottom) - Math.max(r.top, tr.top)
          if (ix > 1 && iy > 1) obscured.push(tab.textContent ?? 'tab')
        })
        return {
          slotAboveNav: sr.bottom <= nr.top + 2,
          toastAboveNav: tr.bottom <= nr.top + 2,
          toastInsideSlot: slot.contains(toast),
          obscuredTabs: obscured,
        }
      })
      expect(layout).not.toBeNull()
      expect(layout!.slotAboveNav).toBe(true)
      expect(layout!.toastAboveNav).toBe(true)
      expect(layout!.toastInsideSlot).toBe(true)
      expect(layout!.obscuredTabs).toEqual([])
    })
  }
}
