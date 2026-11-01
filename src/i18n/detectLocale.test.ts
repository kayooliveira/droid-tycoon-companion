import { describe, expect, it } from 'vitest'
import { detectBrowserLocale, detectLocaleFromTag } from './detectLocale'

describe('detectLocaleFromTag', () => {
  it('maps Portuguese variants to pt-BR', () => {
    expect(detectLocaleFromTag('pt-BR')).toBe('pt-BR')
    expect(detectLocaleFromTag('pt')).toBe('pt-BR')
  })

  it('defaults other tags to en', () => {
    expect(detectLocaleFromTag('en-US')).toBe('en')
    expect(detectLocaleFromTag('fr')).toBe('en')
  })
})

describe('detectBrowserLocale', () => {
  it('returns a supported locale', () => {
    const loc = detectBrowserLocale()
    expect(['en', 'pt-BR']).toContain(loc)
  })
})
