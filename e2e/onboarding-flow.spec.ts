import { test, expect } from '@playwright/test'

async function waitOnboardingStep(page: import('@playwright/test').Page, step: string) {
  const testId = `onboarding-step-${step}`
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId(testId).getByTestId('onboarding-heading')).toBeVisible()
  await page.waitForFunction(
    (id) => {
      const el = document.querySelector(`[data-testid="${id}"]`)
      if (!el) return false
      const style = getComputedStyle(el)
      if (Number.parseFloat(style.opacity) < 0.9) return false
      const heading = el.querySelector('[data-testid="onboarding-heading"]')
      return Boolean(heading?.textContent?.trim())
    },
    testId,
    { timeout: 10000 },
  )
}

test.beforeEach(async ({ page }) => {
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('four-step onboarding completes to dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitOnboardingStep(page, 'welcome')
  await page.getByTestId('onboarding-start').click()

  await waitOnboardingStep(page, 'cycle')
  await expect(page.getByTestId('onboarding-cycle-path-1')).toBeVisible()
  await page.getByTestId('onboarding-next').click()

  await waitOnboardingStep(page, 'progress')
  await expect(page.getByTestId('onboarding-rebirth-input')).toBeVisible()
  await page.getByTestId('onboarding-next').click()

  await waitOnboardingStep(page, 'features')
  await expect(page.getByTestId('onboarding-finish')).toBeVisible()
  await page.getByTestId('onboarding-finish').click()

  await expect(page.getByRole('heading', { name: /Dashboard|Início/i }).first()).toBeVisible({
    timeout: 10000,
  })
})

test('skip from welcome still reaches dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitOnboardingStep(page, 'welcome')
  await page.getByTestId('onboarding-skip').click()
  await expect(page.getByRole('heading', { name: /Dashboard|Início/i }).first()).toBeVisible({
    timeout: 10000,
  })
})

test('step content visible with prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await waitOnboardingStep(page, 'welcome')
  await page.getByTestId('onboarding-start').click()
  await waitOnboardingStep(page, 'cycle')
  await page.getByTestId('onboarding-next').click()
  await waitOnboardingStep(page, 'progress')
  await expect(page.getByTestId('onboarding-rebirth-preview')).toBeVisible()
})
