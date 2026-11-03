import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import pt from './locales/pt-BR.json'

const KEYS = [
  'designSystem.title',
  'designSystem.componentsTitle',
  'designSystem.swatch.success',
  'designSystem.toastSample',
] as const

function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

describe('designSystem i18n', () => {
  it('has matching keys in pt-BR and en', () => {
    const missing: string[] = []
    for (const key of KEYS) {
      if (typeof get(en, key) !== 'string') missing.push(`en:${key}`)
      if (typeof get(pt, key) !== 'string') missing.push(`pt-BR:${key}`)
    }
    expect(missing, missing.join('\n')).toEqual([])
  })
})
