import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageAdapter } from './adapter'
import { defaultPersistedState } from './types'

describe('LocalStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and loads state', () => {
    const adapter = new LocalStorageAdapter()
    const state = defaultPersistedState()
    state.onboardingComplete = true
    adapter.save(state)
    const loaded = adapter.load()
    expect(loaded?.onboardingComplete).toBe(true)
  })
})
