import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createInitialProgress } from '../domain/progress'
import type { InventoryUnit, TierId } from '../domain/types'
import type { AppLocale } from '../i18n/detectLocale'
import { migratePersistedState } from '../storage/migrations'
import {
  defaultPersistedState,
  PERSIST_SCHEMA_VERSION,
  type PersistedState,
  type ThemeMode,
  type UserSettings,
} from '../storage/types'
import { uid } from '../lib/utils'
import { applyAppearanceToDom } from '../hooks/useAppearance'

interface AppStore extends PersistedState {
  _hydrated: boolean
  setHydrated: (v: boolean) => void
  setOnboardingComplete: (value: boolean) => void
  /** Onboarding: new path resets rebirth progress */
  setPathFresh: (pathId: string) => void
  /** Switch path; keeps rebirth unless resetProgress */
  switchPath: (pathId: string, options?: { resetProgress?: boolean }) => void
  setProgress: (nextRebirth: number, completedOnPath: number) => void
  completeRebirthAdvance: () => void
  undoRebirthStep: () => void
  superRebirthAdvance: () => void
  updateSettings: (partial: Partial<UserSettings>) => void
  setLocale: (locale: AppLocale, source?: 'auto' | 'user') => void
  addInventoryUnit: (droidId: string, tier: TierId, quantity?: number) => void
  updateInventoryUnit: (id: string, patch: Partial<Pick<InventoryUnit, 'tier' | 'quantity'>>) => void
  removeInventoryUnit: (id: string) => void
  markDroidOwned: (droidId: string, tier: TierId) => void
  resetAll: () => void
  importState: (state: PersistedState) => void
  toPersisted: () => PersistedState
}

const storageName = 'droid-tycoon-companion-store'

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...defaultPersistedState(),
      _hydrated: false,
      setHydrated: (v) => set({ _hydrated: v }),

      setOnboardingComplete: (value) => set({ onboardingComplete: value }),

      setPathFresh: (pathId) =>
        set({
          progress: createInitialProgress(pathId),
        }),

      switchPath: (pathId, options) =>
        set((s) => {
          if (pathId === s.progress.pathId) return s
          if (options?.resetProgress) {
            return { progress: createInitialProgress(pathId) }
          }
          return {
            progress: {
              ...s.progress,
              pathId,
            },
          }
        }),

      setProgress: (nextRebirth, completedOnPath) =>
        set((s) => ({
          progress: { ...s.progress, nextRebirth, completedOnPath },
        })),

      completeRebirthAdvance: () =>
        set((s) => {
          const completedOnPath = s.progress.completedOnPath + 1
          const nextRebirth =
            s.progress.nextRebirth >= 40 ? 41 : s.progress.nextRebirth + 1
          return {
            progress: { ...s.progress, completedOnPath, nextRebirth },
          }
        }),

      undoRebirthStep: () =>
        set((s) => {
          if (s.progress.completedOnPath <= 0) {
            return { progress: { ...s.progress, nextRebirth: 1, completedOnPath: 0 } }
          }
          return {
            progress: {
              ...s.progress,
              completedOnPath: s.progress.completedOnPath - 1,
              nextRebirth: Math.max(1, s.progress.nextRebirth - 1),
            },
          }
        }),

      superRebirthAdvance: () =>
        set((s) => {
          const paths = ['path-1', 'path-2', 'path-3', 'path-4', 'path-5', 'path-6']
          const idx = paths.indexOf(s.progress.pathId)
          const next = paths[(idx + 1) % paths.length]!
          return {
            progress: createInitialProgress(next),
            inventory: [],
          }
        }),

      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      setLocale: (locale, source = 'user') =>
        set((s) => ({
          settings: { ...s.settings, locale, localeSource: source },
        })),

      addInventoryUnit: (droidId, tier, quantity = 1) =>
        set((s) => {
          const existing = s.inventory.find((u) => u.droidId === droidId && u.tier === tier)
          if (existing) {
            return {
              inventory: s.inventory.map((u) =>
                u.id === existing.id ? { ...u, quantity: u.quantity + quantity } : u,
              ),
            }
          }
          return {
            inventory: [...s.inventory, { id: uid(), droidId, tier, quantity }],
          }
        }),

      updateInventoryUnit: (id, patch) =>
        set((s) => ({
          inventory: s.inventory.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),

      removeInventoryUnit: (id) =>
        set((s) => ({ inventory: s.inventory.filter((u) => u.id !== id) })),

      markDroidOwned: (droidId, tier) => {
        get().addInventoryUnit(droidId, tier, 1)
      },

      resetAll: () => set({ ...defaultPersistedState(), _hydrated: true }),

      importState: (state) => set({ ...migratePersistedState(state), _hydrated: true }),

      toPersisted: () => {
        const s = get()
        return {
          schemaVersion: PERSIST_SCHEMA_VERSION,
          onboardingComplete: s.onboardingComplete,
          progress: s.progress,
          inventory: s.inventory,
          settings: s.settings,
          lastSavedAt: new Date().toISOString(),
        }
      },
    }),
    {
      name: storageName,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => ({
        ...current,
        ...migratePersistedState(persisted),
        _hydrated: true,
      }),
      partialize: (state) => ({
        schemaVersion: PERSIST_SCHEMA_VERSION,
        onboardingComplete: state.onboardingComplete,
        progress: state.progress,
        inventory: state.inventory,
        settings: state.settings,
        lastSavedAt: new Date().toISOString(),
      }),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ _hydrated: true })
      },
    },
  ),
)

/**
 * @deprecated Use `useAppearance` / `applyAppearanceToDom`. Kept for settings.theme compat sync.
 */
export function applyTheme(theme: ThemeMode): void {
  const s = useAppStore.getState().settings
  const modePref =
    theme === 'system' || theme === 'light' || theme === 'dark' ? theme : s.appearanceMode
  applyAppearanceToDom(s.appearanceTheme, modePref)
}
