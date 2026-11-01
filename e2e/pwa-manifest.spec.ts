import { test, expect } from '@playwright/test'

test('PWA manifest is valid JSON with icons and DT Helper name', async ({ request, page }) => {
  const manifestRes = await request.get('/manifest.webmanifest')
  expect(manifestRes.ok()).toBeTruthy()
  const contentType = manifestRes.headers()['content-type'] ?? ''
  expect(contentType).toMatch(/manifest\+json|json/)

  const manifest = await manifestRes.json()
  expect(manifest.name).toBe('DT Helper')
  expect(manifest.short_name).toBe('DT Helper')
  expect(manifest.id).toBe('/')

  const iconSrcs: string[] = manifest.icons.map((i: { src: string }) => i.src.split('?')[0])
  for (const src of iconSrcs) {
    const iconRes = await request.get(src)
    expect(iconRes.ok(), `icon ${src} should resolve`).toBeTruthy()
    expect(iconRes.headers()['content-type']).toMatch(/image\/png/)
  }

  await page.goto('/')
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    /apple-touch-icon\.png\?v=4/,
  )
})
