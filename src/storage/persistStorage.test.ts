import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { idbGet, idbRemove } from './idbStorage'
import { ZUSTAND_PERSIST_KEY, idbPersistStorage } from './persistStorage'

describe('idbPersistStorage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await idbRemove(ZUSTAND_PERSIST_KEY).catch(() => undefined)
  })

  it('migrates zustand localStorage into IndexedDB without data loss', async () => {
    const payload = JSON.stringify({
      state: {
        schemaVersion: 2,
        onboardingComplete: true,
        progress: { pathId: 'path-1', nextRebirth: 2, completedOnPath: 1 },
        inventory: [],
        settings: {
          locale: 'pt-BR',
          localeSource: 'user',
          theme: 'dark',
          trackInventory: true,
          animationsEnabled: true,
          disputedPreference: {},
          installBannerDismissed: true,
          iosInstallHintDismissed: true,
        },
        lastSavedAt: new Date().toISOString(),
      },
      version: 0,
    })
    localStorage.setItem(ZUSTAND_PERSIST_KEY, payload)

    const loaded = await idbPersistStorage.getItem(ZUSTAND_PERSIST_KEY)
    expect(loaded).toBe(payload)
    expect(localStorage.getItem(ZUSTAND_PERSIST_KEY)).toBeNull()
    expect(await idbGet(ZUSTAND_PERSIST_KEY)).toBe(payload)
  })

  it('persists through IndexedDB on setItem', async () => {
    const payload = JSON.stringify({ state: { onboardingComplete: false }, version: 0 })
    await idbPersistStorage.setItem(ZUSTAND_PERSIST_KEY, payload)
    expect(await idbGet(ZUSTAND_PERSIST_KEY)).toBe(payload)
  })
})
