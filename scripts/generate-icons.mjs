import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = path.join(process.cwd(), 'public')
const svgPath = path.join(publicDir, 'favicon.svg')

function gradientBackground(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="45%" stop-color="#1d4ed8"/>
        <stop offset="100%" stop-color="#0891b2"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stop-color="#5eead4" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#5eead4" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#g)"/>
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#glow)"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function appIcon(outFile, size, { maskable = false, monochrome = false } = {}) {
  const inner = maskable ? Math.round(size * 0.52) : Math.round(size * 0.58)
  const fg = await sharp(svgPath).resize(inner, inner).png().toBuffer()

  if (monochrome) {
    await sharp(fg)
      .greyscale()
      .threshold(40)
      .negate()
      .png()
      .toFile(path.join(publicDir, outFile))
    console.log('wrote', outFile)
    return
  }

  const bg = await gradientBackground(size)
  await sharp(bg)
    .composite([{ input: fg, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, outFile))
  console.log('wrote', outFile)
}

await appIcon('pwa-192.png', 192)
await appIcon('pwa-512.png', 512)
await appIcon('pwa-512-maskable.png', 512, { maskable: true })
await appIcon('pwa-monochrome.png', 512, { monochrome: true })
await appIcon('apple-touch-icon.png', 180)
await appIcon('favicon-32.png', 32)
await appIcon('favicon-16.png', 16)

await sharp(path.join(publicDir, 'og-image.svg'))
  .resize(1200, 630, { fit: 'cover' })
  .png()
  .toFile(path.join(publicDir, 'og-image.png'))
console.log('wrote og-image.png')

const favicon32Path = path.join(publicDir, 'favicon-32.png')
const png32 = await sharp(favicon32Path).png().toBuffer()
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(1, 4)
const icoEntry = Buffer.alloc(16)
icoEntry[0] = 32
icoEntry[1] = 32
icoEntry.writeUInt16LE(1, 4)
icoEntry.writeUInt16LE(32, 6)
icoEntry.writeUInt32LE(png32.length, 8)
icoEntry.writeUInt32LE(6 + 16, 12)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, icoEntry, png32]))
console.log('wrote favicon.ico')

const shotsDir = path.join(publicDir, 'screenshots')
fs.mkdirSync(shotsDir, { recursive: true })

async function manifestScreenshot(outName, width, height, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0c121c"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <text x="50%" y="45%" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="${Math.round(width * 0.045)}" text-anchor="middle">DT Helper</text>
    <text x="50%" y="55%" fill="#38bdf8" font-family="system-ui,sans-serif" font-size="${Math.round(width * 0.035)}" text-anchor="middle">${label}</text>
  </svg>`
  await sharp(Buffer.from(svg)).png().toFile(path.join(shotsDir, outName))
  console.log('wrote screenshots/' + outName)
}

await manifestScreenshot('mobile-narrow.png', 390, 844, 'Progress')
await manifestScreenshot('mobile-wide.png', 844, 390, 'Dashboard')
