import type { PersistedState } from './types'
import { migratePersistedState } from './migrations'

export const EXPORT_VERSION = 1

export interface ExportPayload {
  exportVersion: number
  exportedAt: string
  state: PersistedState
}

export function exportProgress(state: PersistedState): ExportPayload {
  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
}

export function parseImportJson(text: string): { ok: true; state: PersistedState } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text) as ExportPayload | PersistedState
    const state =
      'exportVersion' in (parsed as ExportPayload) && (parsed as ExportPayload).state
        ? (parsed as ExportPayload).state
        : (parsed as PersistedState)
    return { ok: true, state: migratePersistedState(state) }
  } catch {
    return { ok: false, error: 'Invalid JSON file' }
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
