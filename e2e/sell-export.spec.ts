import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

test.describe('sell list and cycle export', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/onboarding')
    await page.getByTestId('onboarding-skip').click()
  })

  test('progress shows sell-after list', async ({ page }) => {
    await page.goto('/settings')
    await page.getByTestId('language-select').selectOption('pt-BR')
    await page.goto('/progress')
    await expect(page.getByTestId('sell-after-list').or(page.getByTestId('sell-after-empty'))).toBeVisible({
      timeout: 15000,
    })
  })

  test('PDF export produces a non-empty file', async ({ page }) => {
    await page.goto('/progress')
    const downloadPromise = page.waitForEvent('download', { timeout: 120000 })
    await page.getByTestId('export-cycle-pdf').click()
    const download = await downloadPromise
    const filePath = await download.path()
    expect(filePath).toBeTruthy()
    const stat = fs.statSync(filePath!)
    expect(stat.size).toBeGreaterThan(5000)
  })

  test('PNG export produces a non-empty file', async ({ page }) => {
    await page.goto('/progress')
    const downloadPromise = page.waitForEvent('download', { timeout: 120000 })
    await page.getByTestId('export-cycle-png').click()
    const download = await downloadPromise
    const stat = fs.statSync((await download.path())!)
    expect(stat.size).toBeGreaterThan(3000)
  })

  test('sell center safe section when inventory has extras', async ({ page }) => {
    await page.goto('/settings')
    await page.getByLabel(/Track inventory|Rastrear inventário/i).check()
    await page.goto('/inventory')
    await page.getByPlaceholder(/Search|Buscar/i).first().fill('Gonk')
    await page.getByRole('button', { name: /Add|Adicionar/i }).first().click()
    await page.goto('/sell')
    await expect(page.getByRole('heading', { name: /Sell|Vender|Central/i }).first()).toBeVisible()
  })
})
