import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { AppearanceModePref, AppearanceTheme } from '../storage/types'
import { useAppStore } from '../store/useAppStore'

export type { AppearanceModePref, AppearanceTheme }

const THEME_META: Record<AppearanceTheme, Record<'dark' | 'light', string>> = {
  oficina: { dark: '#121315', light: '#ECEBE6' },
  figurinhas: { dark: '#0F1C2E', light: '#F2EDE0' },
  cartaz: { dark: '#0A0A0B', light: '#F3F2EE' },
}

const FONT_PRELOAD: Record<AppearanceTheme, string[]> = {
  oficina: ['archivo-var', 'plex-mono-500', 'plex-mono-400'],
  figurinhas: ['bricolage-var', 'figtree-var'],
  cartaz: ['big-shoulders-900', 'big-shoulders-800', 'hanken-var'],
}

function syncNestedScopes() {
  const mode = document.documentElement.dataset.mode
  document.querySelectorAll('[data-theme-scope]').forEach((el) => {
    if (mode) (el as HTMLElement).dataset.mode = mode
  })
}

export function resolveAppearanceMode(pref: AppearanceModePref): 'dark' | 'light' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

export function applyAppearanceToDom(theme: AppearanceTheme, modePref: AppearanceModePref) {
  const root = document.documentElement
  const mode = resolveAppearanceMode(modePref)
  root.dataset.theme = theme
  root.dataset.pref = modePref
  root.dataset.mode = mode
  try {
    localStorage.setItem('dd-theme', theme)
    localStorage.setItem('dd-mode', modePref)
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_META[theme][mode])
  FONT_PRELOAD[theme].forEach((name) => {
    const href = `/fonts/dd/${name}.woff2`
    if (document.querySelector(`link[href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = ''
    link.href = href
    document.head.appendChild(link)
  })
  syncNestedScopes()
}

export function useAppearance() {
  const theme = useAppStore((s) => s.settings.appearanceTheme)
  const modePref = useAppStore((s) => s.settings.appearanceMode)
  const updateSettings = useAppStore((s) => s.updateSettings)

  useEffect(() => {
    applyAppearanceToDom(theme, modePref)
  }, [theme, modePref])

  useEffect(() => {
    if (modePref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyAppearanceToDom(theme, 'system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [modePref, theme])

  const setTheme = useCallback(
    (next: AppearanceTheme) => updateSettings({ appearanceTheme: next }),
    [updateSettings],
  )
  const setModePref = useCallback(
    (next: AppearanceModePref) =>
      updateSettings({ appearanceMode: next, theme: next === 'system' ? 'system' : next }),
    [updateSettings],
  )

  const resolvedMode = useSyncExternalStore(
    (onStore) => {
      if (modePref !== 'system') return () => {}
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', onStore)
      return () => mq.removeEventListener('change', onStore)
    },
    () => resolveAppearanceMode(modePref),
    () => 'dark' as const,
  )

  return { theme, modePref, resolvedMode, setTheme, setModePref }
}
