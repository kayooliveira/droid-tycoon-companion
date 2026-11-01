import { describe, expect, it } from 'vitest'
import { validateGameData } from './dataValidation'

describe('game data validation', () => {
  it('has no error-level issues', () => {
    const issues = validateGameData()
    const errors = issues.filter((i) => i.level === 'error')
    expect(errors).toEqual([])
  })

  it('every droid has image path or missing flag', () => {
    const issues = validateGameData()
    const missing = issues.filter((i) => i.message.includes('no imageLocal'))
    expect(missing.length).toBeLessThanOrEqual(8)
  })
})
