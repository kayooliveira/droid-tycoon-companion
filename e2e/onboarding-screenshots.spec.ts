import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS = '/opt/cursor/artifacts/onboarding-390x844'

const STEPS = ['welcome', 'cycles', 'inventory', 'progress'] as const

test('onboarding steps 390x844 dark and light', async ({ page }) => {
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.setViewportSize({ width: 390, height: 844 })

  for (const theme of ['dark', 'light'] as const) {
    if (theme === 'light') {
      await page.evaluate(() => document.documentElement.classList.add('theme-light'))
    } else {
      await page.evaluate(() => document.documentElement.classList.remove('theme-light'))
    }
    await page.goto('/onboarding')
    await page.reload()
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i]!
      await expect(page.getByTestId(`onboarding-step-${step}`)).toBeVisible({ timeout: 15000 })
      await page.screenshot({
        path: path.join(ARTIFACTS, `onboarding-${step}-${theme}-390x844.png`),
        fullPage: false,
      })
      if (i < STEPS.length - 1) {
        await page.getByTestId('onboarding-next').click()
      }
    }
  }
})
