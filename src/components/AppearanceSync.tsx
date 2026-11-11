import { useAppearance } from '../hooks/useAppearance'

/** Applies data-theme / data-mode from persisted settings after hydration. */
export function AppearanceSync() {
  useAppearance()
  return null
}
