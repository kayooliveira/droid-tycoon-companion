import { describe, expect, it } from 'vitest'
import {
  droidMatchesQuery,
  normalizeDroidSearchText,
  pickBestDroidMatch,
  rankDroidNameMatch,
} from './droidNameMatch'

describe('normalizeDroidSearchText', () => {
  it('strips accents, case, and punctuation', () => {
    expect(normalizeDroidSearchText('MO-TRAK')).toBe('motrak')
    expect(normalizeDroidSearchText('mo trak')).toBe('motrak')
    expect(normalizeDroidSearchText('Motrak')).toBe('motrak')
    expect(normalizeDroidSearchText('José')).toBe('jose')
  })
})

describe('rankDroidNameMatch', () => {
  const moTrak = { id: 'mo-trak', name: 'MO-TRAK' }

  it('matches motrak variants to MO-TRAK', () => {
    expect(pickBestDroidMatch('motrak', [moTrak])?.id).toBe('mo-trak')
    expect(pickBestDroidMatch('mo trak', [moTrak])?.id).toBe('mo-trak')
    expect(pickBestDroidMatch('MO-TRAK', [moTrak])?.id).toBe('mo-trak')
    expect(rankDroidNameMatch('motrak', 'MO-TRAK')).toBe('exact')
  })

  it('allows light typo tolerance for longer queries', () => {
    expect(rankDroidNameMatch('motrakk', 'MO-TRAK')).toBe('fuzzy')
    expect(droidMatchesQuery('motrakk', 'MO-TRAK')).toBe(true)
  })
})
