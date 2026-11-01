import { describe, expect, it } from 'vitest'
import { exportProgress, parseImportJson } from './exportImport'
import { defaultPersistedState } from './types'

describe('export/import', () => {
  it('round-trips through JSON', () => {
    const state = defaultPersistedState()
    state.onboardingComplete = true
    const payload = exportProgress(state)
    const parsed = parseImportJson(JSON.stringify(payload))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.state.onboardingComplete).toBe(true)
    }
  })

  it('rejects invalid json', () => {
    const result = parseImportJson('{not json')
    expect(result.ok).toBe(false)
  })
})
