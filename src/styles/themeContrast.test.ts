import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  blendOver,
  contrastRatio,
  extractThemeBlock,
  resolveColor,
  type ThemeVars,
} from './themeContrast'

const THEME_CSS = readFileSync(join(import.meta.dirname, 'theme-tokens.css'), 'utf8')

const TEXT_PAIRS: Array<[string, string]> = [
  ['--ui-fg', '--ui-bg'],
  ['--ui-secondary', '--ui-bg'],
  ['--ui-muted', '--ui-bg'],
  ['--ui-btn-secondary-fg', '--ui-btn-secondary-bg'],
  ['--ui-btn-ghost-fg', '--ui-bg'],
  ['--ui-segment-active-fg', '--ui-segment-active-bg'],
  ['--ui-segment-inactive-fg', '--ui-segment-track'],
  ['--ui-fg', '--ui-raised'],
  ['--ui-muted', '--ui-raised'],
  ['--ui-accent-on', '--ui-accent-solid'],
  ['--ui-success-on', '--ui-success-solid'],
  ['--ui-warn-on', '--ui-warn-solid'],
  ['--ui-danger-on', '--ui-danger-solid'],
]

const UI_BOUNDARY_PAIRS: Array<[string, string]> = [
  ['--ui-border', '--ui-bg'],
  ['--ui-border', '--ui-raised'],
  ['--ui-border-subtle', '--ui-raised'],
]

function assertTheme(name: string, vars: ThemeVars) {
  for (const [fgKey, bgKey] of TEXT_PAIRS) {
    const fg = resolveColor(fgKey, vars)
    const bg = resolveColor(bgKey, vars)
    expect(fg, `${name} ${fgKey}`).not.toBeNull()
    expect(bg, `${name} ${bgKey}`).not.toBeNull()
    const ratio = contrastRatio(fg!, bg!)
    expect(
      ratio,
      `${name} ${fgKey} on ${bgKey} = ${ratio.toFixed(2)} (need ≥4.5)`,
    ).toBeGreaterThanOrEqual(4.5)
  }

  for (const [edgeKey, surfaceKey] of UI_BOUNDARY_PAIRS) {
    const edge = resolveColor(edgeKey, vars)
    const surface = resolveColor(surfaceKey, vars)
    expect(edge, `${name} ${edgeKey}`).not.toBeNull()
    expect(surface, `${name} ${surfaceKey}`).not.toBeNull()
    const edgeOnSurface =
      edge!.a < 1 ? blendOver(edge!, { ...surface!, a: 1 }) : edge!
    const ratio = contrastRatio(edgeOnSurface, surface!)
    expect(
      ratio,
      `${name} boundary ${edgeKey} on ${surfaceKey} = ${ratio.toFixed(2)} (need ≥3)`,
    ).toBeGreaterThanOrEqual(3)
  }

  const bg = resolveColor('--ui-bg', vars)!
  const raised = resolveColor('--ui-raised', vars)!
  const elevated = resolveColor('--ui-elevated', vars)!
  expect(contrastRatio(raised, bg), `${name} raised vs bg`).toBeGreaterThanOrEqual(1.1)
  expect(contrastRatio(elevated, raised), `${name} elevated vs raised`).toBeGreaterThanOrEqual(1.06)
}

describe('theme token contrast', () => {
  it('meets WCAG AA for dark and light semantic pairs', () => {
    assertTheme('dark', extractThemeBlock(THEME_CSS, ':root'))
    assertTheme('light', extractThemeBlock(THEME_CSS, 'html.theme-light'))
  })
})
