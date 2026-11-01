import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import pt from './locales/pt-BR.json'

function walkStrings(obj: unknown, path = ''): Array<[string, string]> {
  if (typeof obj === 'string') return [[path, obj]]
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).flatMap(([k, v]) => walkStrings(v, path ? `${path}.${k}` : k))
  }
  return []
}

describe('i18n copy hygiene', () => {
  it('has no em dash or en dash punctuation in user-facing strings', () => {
    const bad: string[] = []
    for (const [locale, tree] of [
      ['en', en],
      ['pt-BR', pt],
    ] as const) {
      for (const [key, value] of walkStrings(tree)) {
        if (/[\u2013\u2014]/.test(value)) {
          bad.push(`${locale}:${key} → ${value}`)
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([])
  })

  it('has no spaced-dot or spaced-comma em-dash replacements', () => {
    const bad: string[] = []
    for (const [locale, tree] of [
      ['en', en],
      ['pt-BR', pt],
    ] as const) {
      for (const [key, value] of walkStrings(tree)) {
        if (/\s\.\s/.test(value) || /\s,\s/.test(value)) {
          bad.push(`${locale}:${key} → ${value}`)
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([])
  })

  it('has no arrow glyphs in user-facing labels', () => {
    const bad: string[] = []
    for (const [locale, tree] of [
      ['en', en],
      ['pt-BR', pt],
    ] as const) {
      for (const [key, value] of walkStrings(tree)) {
        if (/→/.test(value)) {
          bad.push(`${locale}:${key} → ${value}`)
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([])
  })
})
