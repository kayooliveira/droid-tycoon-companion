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
await appIcon('favicon.svg', 'favicon-32.png', 32)
await appIcon('favicon.svg', 'favicon-16.png', 16)

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

const ogSize = fs.statSync(path.join(publicDir, 'og-image.png')).size
if (ogSize < 5000) throw new Error('og-image.png looks too small')
