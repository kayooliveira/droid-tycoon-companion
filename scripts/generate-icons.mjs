import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = path.join(process.cwd(), 'public')

async function svgToPng(svgFile, outFile, width, height) {
  await sharp(path.join(publicDir, svgFile))
    .resize(width, height, { fit: 'fill' })
    .png()
    .toFile(path.join(publicDir, outFile))
  console.log('wrote', outFile)
}

async function appIcon(svgFile, outFile, size, { maskable = false } = {}) {
  const inner = maskable ? Math.round(size * 0.62) : Math.round(size * 0.72)
  const icon = await sharp(path.join(publicDir, svgFile)).resize(inner, inner).png().toBuffer()
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#0c121c',
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, outFile))
  console.log('wrote', outFile)
}

await svgToPng('og-image.svg', 'og-image.png', 1200, 630)
await appIcon('favicon.svg', 'pwa-192.png', 192)
await appIcon('favicon.svg', 'pwa-512.png', 512)
await appIcon('favicon.svg', 'pwa-512-maskable.png', 512, { maskable: true })
await appIcon('favicon.svg', 'apple-touch-icon.png', 180)

const ogSize = fs.statSync(path.join(publicDir, 'og-image.png')).size
if (ogSize < 5000) throw new Error('og-image.png looks too small')
