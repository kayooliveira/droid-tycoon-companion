export type AppLocale = 'en' | 'pt-BR'

export function detectLocaleFromTag(tag: string): AppLocale {
  const lower = tag.toLowerCase()
  if (lower.startsWith('pt')) return 'pt-BR'
  return 'en'
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en'
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of langs) {
    if (tag) return detectLocaleFromTag(tag)
  }
  return 'en'
}
