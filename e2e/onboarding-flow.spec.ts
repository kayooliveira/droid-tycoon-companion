import { test, expect } from '@playwright/test'

async function waitOnboardingStep(page: import('@playwright/test').Page, step: string) {
  const testId = `onboarding-step-${step}`
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('onboarding-heading')).toBeVisible()
  await page.waitForFunction(
    () => {
      const heading = document.querySelector('[data-testid="onboarding-heading"]')
      return Boolean(heading?.textContent?.trim())
    },
    undefined,
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
  await page.getByTestId('onboarding-next').click()

  await waitOnboardingStep(page, 'cycles')
  await page.getByTestId('onboarding-next').click()

  await waitOnboardingStep(page, 'inventory')
  await page.getByTestId('onboarding-next').click()

  await waitOnboardingStep(page, 'progress')
  await page.getByTestId('onboarding-start').click()

  await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 10000 })
})

test('skip from welcome still reaches dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitOnboardingStep(page, 'welcome')
  await page.getByTestId('onboarding-skip').click()
  await expect(page.getByTestId('home-hub')).toBeVisible({ timeout: 10000 })
})

test('step content visible with prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await waitOnboardingStep(page, 'welcome')
  await page.getByTestId('onboarding-next').click()
  await waitOnboardingStep(page, 'cycles')
  await expect(page.getByTestId('onboarding-heading')).toBeVisible()
})
