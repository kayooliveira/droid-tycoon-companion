import type { StateStorage } from 'zustand/middleware'
import { migratePersistedState } from './migrations'
import { idbGet, idbRemove, idbSet } from './idbStorage'

export const ZUSTAND_PERSIST_KEY = 'droid-tycoon-companion-store'
const LEGACY_V1_KEY = 'droid-tycoon-companion/v1'
const BOOT_MIRROR_KEY = 'droiddeck:boot'

function readLegacyV1(): string | null {
  try {
    const raw = localStorage.getItem(LEGACY_V1_KEY)
    if (!raw) return null
    const migrated = migratePersistedState(JSON.parse(raw))
    return JSON.stringify({ state: migrated, version: 0 })
  } catch {
    return null
  }
}

function mirrorBootFromZustand(raw: string) {
  try {
    const parsed = JSON.parse(raw) as {
      state?: { settings?: { theme?: string; locale?: string } }
    }
    const theme = parsed?.state?.settings?.theme
    const locale = parsed?.state?.settings?.locale
    if (theme || locale) {
      localStorage.setItem(BOOT_MIRROR_KEY, JSON.stringify({ theme, locale }))
    }
  } catch {
    void 0
  }
}

async function migrateFromLocalStorage(name: string): Promise<string | null> {
  try {
    const fromStore = localStorage.getItem(name)
    if (fromStore) {
      await idbSet(name, fromStore)
      localStorage.removeItem(name)
      mirrorBootFromZustand(fromStore)
      return fromStore
    }
    const legacy = readLegacyV1()
    if (legacy) {
      await idbSet(name, legacy)
      localStorage.removeItem(LEGACY_V1_KEY)
      mirrorBootFromZustand(legacy)
      return legacy
    }
  } catch {
    void 0
  }
  return null
}

export const idbPersistStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const fromIdb = await idbGet(name)
      if (fromIdb != null) return fromIdb
      return await migrateFromLocalStorage(name)
    } catch {
      try {
        return localStorage.getItem(name)
      } catch {
        return null
      }
    }
  },
  setItem: async (name, value) => {
    mirrorBootFromZustand(value)
    try {
      await idbSet(name, value)
    } catch {
      localStorage.setItem(name, value)
    }
  },
  removeItem: async (name) => {
    try {
      await idbRemove(name)
    } catch {
      void 0
    }
    try {
      localStorage.removeItem(name)
    } catch {
      void 0
    }
  },
}

export { BOOT_MIRROR_KEY }
