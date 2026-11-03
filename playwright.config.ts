import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview:e2e',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 5'] } },
    { name: 'webkit', use: { ...devices['iPhone 13'] } },
  ],
})
