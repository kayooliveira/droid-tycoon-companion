import type { InventoryUnit } from '../domain/types'

export const PERSIST_SCHEMA_VERSION = 1

export type ThemeMode = 'dark' | 'light' | 'system'

export interface UserSettings {
  theme: ThemeMode
  animationsEnabled: boolean
  trackInventory: boolean
  disputedPreference: Record<string, number>
}

export interface PersistedProgress {
  pathId: string
  nextRebirth: number
  completedOnPath: number
}

export interface PersistedState {
  schemaVersion: number
  onboardingComplete: boolean
  progress: PersistedProgress
  inventory: InventoryUnit[]
  settings: UserSettings
  lastSavedAt: string
}

export const defaultSettings: UserSettings = {
  theme: 'dark',
  animationsEnabled: true,
  trackInventory: true,
  disputedPreference: {},
}

export function defaultPersistedState(): PersistedState {
  return {
    schemaVersion: PERSIST_SCHEMA_VERSION,
    onboardingComplete: false,
    progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
    inventory: [],
    settings: { ...defaultSettings },
    lastSavedAt: new Date().toISOString(),
  }
}
