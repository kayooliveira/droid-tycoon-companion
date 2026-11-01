import { migratePersistedState } from './migrations'
import { defaultPersistedState, type PersistedState } from './types'

export interface StorageAdapter {
  load(): PersistedState | null
  save(state: PersistedState): void
  clear(): void
}

const STORAGE_KEY = 'droid-tycoon-companion/v1'

export class LocalStorageAdapter implements StorageAdapter {
  load(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return migratePersistedState(JSON.parse(raw))
    } catch {
      return defaultPersistedState()
    }
  }

  save(state: PersistedState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/** Placeholder for future cloud sync backends. */
export interface RemoteStorageAdapter extends StorageAdapter {
  sync(): Promise<PersistedState>
}
