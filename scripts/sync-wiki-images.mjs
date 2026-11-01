/**
 * Download Fandom wiki droid images (CC BY-SA), resize to 128px WebP.
 * Droids without wiki URLs use in-app CSS placeholders (no asset files).
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const dataPath = path.join(root, 'src/data/gameData.json')
const outDir = path.join(root, 'public/assets/droids')
const gameData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

const WIKI_SIZE = 128
const WIKI_QUALITY = 78

const WIKI_LICENSE =
  'Star Wars Droid Tycoon Wiki (Fandom), CC BY-SA 4.0 — https://star-wars-droid-tycoon.fandom.com/'

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

const report = { replaced: 0, placeholder: 0, removedPlaceholderFiles: 0, failed: [] }

for (const d of gameData.droids) {
  const filename = `${d.id}.webp`
  const outPath = path.join(outDir, filename)

  if (!d.wikiImageUrl) {
    d.imageLocal = null
    d.imageOriginalFilename = null
    d.imageUrl = null
    d.imageSource = null
    d.imageMissing = true
    report.placeholder++
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      report.removedPlaceholderFiles++
    }
    continue
  }

  try {
    const buf = await download(d.wikiImageUrl)
    const webp = await sharp(buf)
      .resize(WIKI_SIZE, WIKI_SIZE, { fit: 'cover' })
      .webp({ quality: WIKI_QUALITY, effort: 4 })
      .toBuffer()
    fs.writeFileSync(outPath, webp)
    d.imageLocal = `images/${filename}`
    d.imageOriginalFilename = filename
    d.imageUrl = d.wikiImageUrl
    d.imageSource = WIKI_LICENSE
    d.imageMissing = false
    report.replaced++
  } catch (e) {
    report.failed.push({ id: d.id, error: String(e) })
    d.imageLocal = null
    d.imageOriginalFilename = null
    d.imageUrl = d.wikiImageUrl
    d.imageSource = WIKI_LICENSE
    d.imageMissing = true
    report.placeholder++
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      report.removedPlaceholderFiles++
    }
  }
}

fs.writeFileSync(dataPath, JSON.stringify(gameData, null, 2) + '\n')
fs.writeFileSync(
  path.join(outDir, 'ATTRIBUTION.md'),
  `# Droid images

Wiki-sourced files in this folder are from the **Star Wars Droid Tycoon Wiki** on Fandom (CC BY-SA 4.0), resized to ${WIKI_SIZE}px WebP.

- Wiki: https://star-wars-droid-tycoon.fandom.com/
- License: https://creativecommons.org/licenses/by-sa/4.0/

Droids without a wiki image use an in-app CSS placeholder (no file here).

Last sync: ${new Date().toISOString().slice(0, 10)} — ${report.replaced} files, ${report.placeholder} in-app placeholders.
`,
)

console.log(JSON.stringify(report, null, 2))
