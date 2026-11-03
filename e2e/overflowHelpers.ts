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
