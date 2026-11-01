import { defaultPersistedState, PERSIST_SCHEMA_VERSION, type PersistedState } from './types'

export function migratePersistedState(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') {
    return defaultPersistedState()
  }

  const state = raw as Partial<PersistedState>
  const version = state.schemaVersion ?? 0

  if (version === PERSIST_SCHEMA_VERSION) {
    return sanitize(state)
  }

  // Future migrations by version
  return sanitize({ ...defaultPersistedState(), ...state, schemaVersion: PERSIST_SCHEMA_VERSION })
}

function sanitize(partial: Partial<PersistedState>): PersistedState {
  const base = defaultPersistedState()
  const progress = partial.progress ?? base.progress
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
      ...(partial.settings ?? {}),
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
