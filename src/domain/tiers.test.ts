import { describe, expect, it } from 'vitest'
import { tierMeetsRequired, compareTiers } from './tiers'

describe('tierMeetsRequired', () => {
  it('higher tier satisfies lower', () => {
    expect(tierMeetsRequired('diamond', 'gold')).toBe(true)
    expect(tierMeetsRequired('gold', 'diamond')).toBe(false)
  })

  it('scourge satisfies any requirement (partial rule)', () => {
    expect(tierMeetsRequired('scourge', 'kyber')).toBe(true)
  })

  it('compareTiers orders correctly', () => {
    expect(compareTiers('gold', 'default')).toBeGreaterThan(0)
  })
})
