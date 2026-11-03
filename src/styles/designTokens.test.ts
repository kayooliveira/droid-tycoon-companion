import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '../..')

const REQUIRED_VARS = [
  '--space-4',
  '--radius-lg',
  '--text-base-size',
  '--motion-duration-normal',
  '--elevation-2',
  '--tier-gold',
  '--tier-diamond',
  '--ui-bg',
  '--z-index-toast',
]

describe('design system tokens', () => {
  it('defines core CSS variables in design and theme files', () => {
    const design = readFileSync(join(ROOT, 'src/styles/design-tokens.css'), 'utf8')
    const theme = readFileSync(join(ROOT, 'src/styles/theme-tokens.css'), 'utf8')
    const index = readFileSync(join(ROOT, 'src/index.css'), 'utf8')
    const blob = `${design}\n${theme}\n${index}`
    const missing = REQUIRED_VARS.filter((v) => !blob.includes(v))
    expect(missing, missing.join(', ')).toEqual([])
  })
})
