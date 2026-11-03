import type { InventoryUnit } from '../domain/types'
import type { AppLocale } from '../i18n/detectLocale'
import { detectBrowserLocale } from '../i18n/detectLocale'

export const PERSIST_SCHEMA_VERSION = 2

export type ThemeMode = 'dark' | 'light' | 'system'

export interface UserSettings {
  theme: ThemeMode
  animationsEnabled: boolean
  trackInventory: boolean
  disputedPreference: Record<string, number>
  locale: AppLocale
  localeSource: 'auto' | 'user'
  installBannerDismissed: boolean
  iosInstallHintDismissed: boolean
  /** Progress list mode: when false, all rebirth rows start collapsed. Default expanded. */
  progressListAllExpanded?: boolean
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

export const defaultSettings = (): UserSettings => ({
  theme: 'dark',
  animationsEnabled: true,
  trackInventory: true,
  disputedPreference: {},
  locale: typeof navigator !== 'undefined' ? detectBrowserLocale() : 'en',
  localeSource: 'auto',
  installBannerDismissed: false,
  iosInstallHintDismissed: false,
  progressListAllExpanded: true,
})

export function defaultPersistedState(): PersistedState {
  return {
    schemaVersion: PERSIST_SCHEMA_VERSION,
    onboardingComplete: false,
    progress: { pathId: 'path-1', nextRebirth: 1, completedOnPath: 0 },
    inventory: [],
    settings: defaultSettings(),
    lastSavedAt: new Date().toISOString(),
  }
}
