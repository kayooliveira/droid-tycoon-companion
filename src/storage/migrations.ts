import { detectBrowserLocale } from '../i18n/detectLocale'
import { defaultPersistedState, PERSIST_SCHEMA_VERSION, type PersistedState, type UserSettings } from './types'

export function migratePersistedState(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') {
    return defaultPersistedState()
  }

  const state = raw as Partial<PersistedState>
  const version = state.schemaVersion ?? 1

  let base = sanitize({ ...defaultPersistedState(), ...state })

  if (version < 2) {
    const settings = base.settings as UserSettings & { locale?: string }
    base = {
      ...base,
      schemaVersion: PERSIST_SCHEMA_VERSION,
      settings: {
        ...base.settings,
        locale: settings.locale === 'pt-BR' ? 'pt-BR' : detectBrowserLocale(),
        localeSource: 'auto',
        installBannerDismissed: false,
        iosInstallHintDismissed: false,
      },
    }
  }

  return { ...base, schemaVersion: PERSIST_SCHEMA_VERSION }
}

function sanitize(partial: Partial<PersistedState>): PersistedState {
  const base = defaultPersistedState()
  const progress = partial.progress ?? base.progress
  const settingsIn = partial.settings ?? base.settings
  return {
    schemaVersion: PERSIST_SCHEMA_VERSION,
    onboardingComplete: Boolean(partial.onboardingComplete),
    progress: {
      pathId: progress.pathId || 'path-1',
      nextRebirth: clamp(progress.nextRebirth ?? 1, 1, 41),
      completedOnPath: clamp(progress.completedOnPath ?? 0, 0, 40),
    },
    inventory: Array.isArray(partial.inventory) ? partial.inventory.filter(isValidUnit) : [],
    settings: {
      ...base.settings,
      ...settingsIn,
      locale: settingsIn.locale === 'pt-BR' ? 'pt-BR' : 'en',
      localeSource: settingsIn.localeSource === 'user' ? 'user' : 'auto',
    },
    lastSavedAt: partial.lastSavedAt ?? new Date().toISOString(),
  }
}

function isValidUnit(u: unknown): boolean {
  if (!u || typeof u !== 'object') return false
  const unit = u as Record<string, unknown>
  return (
    typeof unit.id === 'string' &&
    typeof unit.droidId === 'string' &&
    typeof unit.tier === 'string' &&
    typeof unit.quantity === 'number' &&
    unit.quantity > 0
  )
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
