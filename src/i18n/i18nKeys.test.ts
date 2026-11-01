import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import pt from './locales/pt-BR.json'

function leafKeys(obj: unknown, path = ''): string[] {
  if (typeof obj === 'string') return [path]
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).flatMap(([k, v]) => leafKeys(v, path ? `${path}.${k}` : k))
  }
  return []
}

const ALLOW_IDENTICAL = new Set([
  'app.name',
  'app.shortName',
  'nav.droiddex',
  'onboarding.welcomeTitle',
  'droiddex.title',
  'share.message',
  'feedback.whatsappCtaEn',
  'seo.defaultTitle',
  'seo.ogImageAlt',
  'seo.ogImageAltPt',
  'pdf.pageFooter',
])

describe('i18n locale parity', () => {
  it('en and pt-BR have identical key sets', () => {
    const ke = new Set(leafKeys(en))
    const kp = new Set(leafKeys(pt))
    const missingPt = [...ke].filter((k) => !kp.has(k)).sort()
    const extraPt = [...kp].filter((k) => !ke.has(k)).sort()
    expect(missingPt, `missing in pt-BR:\n${missingPt.join('\n')}`).toEqual([])
    expect(extraPt, `extra in pt-BR:\n${extraPt.join('\n')}`).toEqual([])
  })

  it('pt-BR long strings should not copy English verbatim', () => {
    function walk(objEn: unknown, objPt: unknown, path = ''): string[] {
      if (typeof objEn === 'string' && typeof objPt === 'string') {
        if (path.endsWith('_one') || path.endsWith('_other')) return []
        if (ALLOW_IDENTICAL.has(path)) return []
        if (objEn.length >= 24 && objEn === objPt && /[a-zA-Z]/.test(objEn)) {
          return [`${path}: ${objPt}`]
        }
        return []
      }
      if (objEn && objPt && typeof objEn === 'object' && typeof objPt === 'object') {
        return Object.keys(objEn as object).flatMap((k) => {
          const next = path ? `${path}.${k}` : k
          return walk(
            (objEn as Record<string, unknown>)[k],
            (objPt as Record<string, unknown>)[k],
            next,
          )
        })
      }
      return []
    }
    const bad = walk(en, pt)
    expect(bad, bad.join('\n')).toEqual([])
  })
})
