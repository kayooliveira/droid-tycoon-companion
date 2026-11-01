import { describe, expect, it } from 'vitest'
import { migratePersistedState } from './migrations'
import { defaultPersistedState } from './types'

describe('migrations', () => {
  it('returns defaults for invalid input', () => {
    const s = migratePersistedState(null)
    expect(s.progress.pathId).toBe('path-1')
  })

  it('clamps invalid rebirth values', () => {
    const s = migratePersistedState({
      ...defaultPersistedState(),
      progress: { pathId: 'path-1', nextRebirth: 999, completedOnPath: -5 },
    })
    expect(s.progress.nextRebirth).toBeLessThanOrEqual(41)
    expect(s.progress.completedOnPath).toBeGreaterThanOrEqual(0)
  })
})
