import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const base = process.env.DD_APP_BASE || 'http://127.0.0.1:4173'
const out = process.env.UX_ARTIFACTS_DIR || '/opt/cursor/artifacts'
const combos = [
  ['oficina', 'dark'],
  ['oficina', 'light'],
  ['figurinhas', 'dark'],
  ['figurinhas', 'light'],
  ['cartaz', 'dark'],
  ['cartaz', 'light'],
]

fs.mkdirSync(path.join(out, 'theme-modes'), { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

for (const [theme, mode] of combos) {
  await page.goto(`${base}/settings/appearance?theme=${theme}&mode=${mode}`)
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(out, 'theme-modes', `${theme}-${mode}.png`),
    fullPage: true,
  })
}

await browser.close()
console.log(`Wrote 6 screenshots to ${path.join(out, 'theme-modes')}`)
