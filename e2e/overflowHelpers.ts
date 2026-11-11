import type { Page } from '@playwright/test'
import type { TierId } from '../src/domain/types'

export const STORE_KEY = 'droid-tycoon-companion-store'

const TIER_IDS: TierId[] = [
  'default',
  'gold',
  'diamond',
  'rainbow',
  'beskar',
  'galactic',
  'stellar',
  'kyber',
  'scourge',
]

/** Realistic heavy inventory: all tiers, long names, many rows. */
export function buildHeavyInventory(): Array<{
  id: string
  droidId: string
  tier: TierId
  quantity: number
}> {
  const droids = [
    'util-tec-ulti-tech',
    'r2-d2',
    'bb-8',
    'r7',
    'opti-pod',
    'mono-wlkr',
    'jo9-4mn',
    'proto-roller',
    'b2-rp',
    'b2-super',
    'chopper',
    'c-3po',
    'mecha-droid',
    'cyclo-grav',
    'drk-1-probe',
    'pit',
    'cb',
    'r2-d2',
    'bb-8',
    'r7',
  ]
  const units: Array<{ id: string; droidId: string; tier: TierId; quantity: number }> = []
  let n = 0
  for (const tier of TIER_IDS) {
    for (const droidId of droids) {
      units.push({
        id: `heavy-${n++}`,
        droidId,
        tier,
        quantity: 1 + (n % 4),
      })
    }
  }
  return units
}

export function heavyAppState(theme: 'dark' | 'light') {
  return {
    schemaVersion: 2,
    onboardingComplete: true,
    progress: { pathId: 'path-1', nextRebirth: 13, completedOnPath: 12 },
    inventory: buildHeavyInventory(),
    settings: {
      locale: 'pt-BR',
      localeSource: 'user',
      appearanceTheme: 'oficina',
      appearanceMode: theme,
      theme,
      trackInventory: true,
      animationsEnabled: false,
      disputedPreference: {},
      installBannerDismissed: true,
      iosInstallHintDismissed: true,
    },
    lastSavedAt: new Date().toISOString(),
  }
}

export async function seedHeavyStore(page: Page, theme: 'dark' | 'light') {
  await page.goto('/onboarding')
  await page.evaluate(
    ({ key, state }) => {
      localStorage.setItem(key, JSON.stringify({ state, version: 0 }))
    },
    { key: STORE_KEY, state: heavyAppState(theme) },
  )
}

export type OverflowIssue = {
  tag: string
  id: string
  className: string
  right: number
  left: number
  width: number
  scrollWidth: number
  clientWidth: number
  path: string
}

export async function collectHorizontalOverflow(page: Page): Promise<{
  documentScrollWidth: number
  viewportWidth: number
  issues: OverflowIssue[]
}> {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth
    const documentScrollWidth = document.documentElement.scrollWidth

    function overflowXAllowsScroll(el: Element | null): boolean {
      let node: Element | null = el
      while (node && node !== document.documentElement) {
        const ox = getComputedStyle(node).overflowX
        if (ox === 'auto' || ox === 'scroll' || ox === 'overlay') return true
        node = node.parentElement
      }
      return false
    }

    function shortPath(el: Element): string {
      const parts: string[] = []
      let node: Element | null = el
      while (node && parts.length < 5 && node !== document.body) {
        const id = node.id ? `#${node.id}` : ''
        const cls =
          node.classList && node.classList.length
            ? `.${Array.from(node.classList).slice(0, 2).join('.')}`
            : ''
        parts.unshift(`${node.tagName.toLowerCase()}${id}${cls}`)
        node = node.parentElement
      }
      return parts.join(' > ')
    }

    const issues: OverflowIssue[] = []
    const nodes = document.querySelectorAll('body *')
    for (const el of nodes) {
      const rect = el.getBoundingClientRect()
      if (rect.width < 1 && rect.height < 1) continue
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || style.display === 'none') continue
      const beyondRight = rect.right > viewportWidth + 0.5
      const beyondLeft = rect.left < -0.5
      if (!beyondRight && !beyondLeft) continue
      if (overflowXAllowsScroll(el)) continue
      const htmlEl = el as HTMLElement
      issues.push({
        tag: el.tagName.toLowerCase(),
        id: htmlEl.id ?? '',
        className: typeof htmlEl.className === 'string' ? htmlEl.className.slice(0, 120) : '',
        right: rect.right,
        left: rect.left,
        width: rect.width,
        scrollWidth: htmlEl.scrollWidth,
        clientWidth: htmlEl.clientWidth,
        path: shortPath(el),
      })
    }

    return { documentScrollWidth, viewportWidth, issues }
  })
}

export type InventoryCardIssue = {
  kind: 'overlap' | 'clip' | 'chip-contrast' | 'name-truncated'
  detail: string
}

export async function auditInventoryCards(page: Page): Promise<InventoryCardIssue[]> {
  return page.evaluate(() => {
    const issues: InventoryCardIssue[] = []

    function parseRgb(color: string): [number, number, number] | null {
      const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return null
      return [Number(m[1]), Number(m[2]), Number(m[3])]
    }

    function relLuminance([r, g, b]: [number, number, number]) {
      const s = [r, g, b].map((v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * s[0]! + 0.7152 * s[1]! + 0.0722 * s[2]!
    }

    function contrastRatio(fg: string, bg: string): number | null {
      const f = parseRgb(fg)
      const b = parseRgb(bg)
      if (!f || !b) return null
      const l1 = relLuminance(f)
      const l2 = relLuminance(b)
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      return (lighter + 0.05) / (darker + 0.05)
    }

    function visibleTextElements(root: Element): HTMLElement[] {
      const out: HTMLElement[] = []
      root.querySelectorAll('p, span, button').forEach((el) => {
        const node = el as HTMLElement
        const style = getComputedStyle(node)
        if (style.visibility === 'hidden' || style.display === 'none') return
        const text = node.textContent?.trim()
        if (!text) return
        if (node.tagName === 'BUTTON' && node.querySelector('svg')) return
        const rect = node.getBoundingClientRect()
        if (rect.width < 2 || rect.height < 2) return
        out.push(node)
      })
      return out
    }

    function rectsOverlap(a: DOMRect, b: DOMRect, minPx = 6): boolean {
      const left = Math.max(a.left, b.left)
      const right = Math.min(a.right, b.right)
      const top = Math.max(a.top, b.top)
      const bottom = Math.min(a.bottom, b.bottom)
      if (right <= left || bottom <= top) return false
      return (right - left) * (bottom - top) >= minPx
    }

    const cards = Array.from(document.querySelectorAll('[data-testid="inventory-unit-card"]')).slice(
      0,
      3,
    ) as HTMLElement[]

    for (const card of cards) {
      const nameEl = card.querySelector('[data-testid="inventory-unit-name"]') as HTMLElement | null
      if (nameEl) {
        const style = getComputedStyle(nameEl)
        const singleLineEllipsis =
          style.textOverflow === 'ellipsis' &&
          style.whiteSpace === 'nowrap' &&
          nameEl.scrollWidth > nameEl.clientWidth + 1
        if (singleLineEllipsis) {
          issues.push({
            kind: 'name-truncated',
            detail: `name single-line ellipsis: "${nameEl.textContent?.slice(0, 40)}"`,
          })
        }
      }

      const texts = visibleTextElements(card)
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i]!
          const b = texts[j]!
          if (a.contains(b) || b.contains(a)) continue
          const ra = a.getBoundingClientRect()
          const rb = b.getBoundingClientRect()
          if (rectsOverlap(ra, rb)) {
            issues.push({
              kind: 'overlap',
              detail: `"${a.textContent?.slice(0, 24)}" overlaps "${b.textContent?.slice(0, 24)}"`,
            })
          }
        }
        const el = texts[i]!
        const style = getComputedStyle(el)
        const ox = style.overflowX
        const clipped =
          (ox === 'hidden' || ox === 'clip' || style.textOverflow === 'ellipsis') &&
          el.scrollWidth > el.clientWidth + 2 &&
          style.whiteSpace === 'nowrap'
        if (clipped) {
          issues.push({
            kind: 'clip',
            detail: `clipped nowrap text: "${el.textContent?.slice(0, 32)}"`,
          })
        }
      }
    }

    for (const testId of ['inventory-rarity-chips-all', 'inventory-tier-chips-all']) {
      const chip = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
      if (!chip) continue
      const style = getComputedStyle(chip)
      const ratio = contrastRatio(style.color, style.backgroundColor)
      if (ratio !== null && ratio < 3) {
        issues.push({
          kind: 'chip-contrast',
          detail: `${testId} contrast ${ratio.toFixed(2)} (fg ${style.color}, bg ${style.backgroundColor})`,
        })
      }
    }

    return issues
  })
}
