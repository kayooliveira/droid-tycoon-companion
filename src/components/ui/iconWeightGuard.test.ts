import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '../..')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(p, out)
    } else if (p.endsWith('.tsx')) {
      out.push(p)
    }
  }
  return out
}

describe('Phosphor icon weight guard', () => {
  it('uses fill weight only in MobileFloatingNav for active tabs', () => {
    const offenders: string[] = []
    for (const file of walk(ROOT)) {
      const rel = file.slice(ROOT.length + 1)
      const text = readFileSync(file, 'utf8')
      if (rel === 'components/MobileFloatingNav.tsx') {
        if (/weight="fill"/.test(text)) {
          offenders.push(`${rel}: static weight="fill" not allowed`)
        }
        continue
      }
      if (/weight="fill"|weight='fill'/.test(text)) {
        offenders.push(rel)
      }
      if (rel === 'components/ui/iconStyle.ts' && /UI_ICON_WEIGHT = 'fill'/.test(text)) {
        offenders.push(`${rel}: UI_ICON_WEIGHT must not be fill`)
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
