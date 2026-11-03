/** WCAG 2.x contrast helpers for design token pairs (unit tests). */

export type Rgb = { r: number; g: number; b: number; a: number }

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGB = /^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*([\d.]+))?\s*\)$/

export function parseCssColor(raw: string): Rgb | null {
  const s = raw.trim()
  const hex = HEX.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    }
  }
  const rgb = RGB.exec(s)
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] !== undefined ? Number(rgb[4]) : 1,
    }
  }
  return null
}

export function blendOver(fg: Rgb, bg: Rgb): Rgb {
  const a = fg.a + bg.a * (1 - fg.a)
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 1 }
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a: 1,
  }
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const f = blendOver({ ...fg, a: fg.a ?? 1 }, { ...bg, a: 1 })
  const l1 = relativeLuminance(f)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ThemeVars = Record<string, string>

export function extractThemeBlock(css: string, selector: ':root' | 'html.theme-light'): ThemeVars {
  return extractCssVarsBlock(
    css,
    selector === ':root' ? ':root' : 'html.theme-light',
  )
}

/** First `{...}` block for a selector (e.g. `:root`, `html.theme-light`). */
export function extractCssVarsBlock(css: string, selector: string): ThemeVars {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 's')
  const m = re.exec(css)
  if (!m) return {}
  const vars: ThemeVars = {}
  for (const line of m[1].split('\n')) {
    const vm = /--([a-z0-9-]+):\s*([^;]+);/.exec(line)
    if (vm) vars[`--${vm[1]}`] = vm[2].trim()
  }
  return vars
}

export function mergeThemeVars(base: ThemeVars, override: ThemeVars): ThemeVars {
  return { ...base, ...override }
}

export function resolveVar(name: string, vars: ThemeVars, depth = 0): string | null {
  if (depth > 8) return null
  const v = vars[name]
  if (!v) return null
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(v)
  if (ref) return resolveVar(ref[1], vars, depth + 1)
  return v
}

export function resolveColor(name: string, vars: ThemeVars): Rgb | null {
  const raw = resolveVar(name, vars)
  if (!raw) return null
  return parseCssColor(raw)
}
