import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import pt from './locales/pt-BR.json'

const TOAST_KEY_PATHS = [
  'progress.rebirthCompleted',
  'progress.rebirthUndone',
  'progress.inventoryDeltaPlus',
  'progress.inventoryRemovedUnit',
  'progress.inventoryRestored',
  'path.switched',
  'inventory.added',
  'inventory.removed',
  'settings.importOk',
  'settings.importFail',
  'settings.resetDone',
  'share.linkCopied',
  'share.cardShared',
  'share.cardDownloaded',
  'share.cardFailed',
  'exportProgress.pdfDone',
  'exportCycle.pdfDone',
  'exportCycle.pngDone_one',
  'exportCycle.failed',
  'cycles.exportGuideDone',
  'pwa.updatedToast',
  'pwa.update',
] as const

function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

describe('toast i18n keys', () => {
  it('defines the same toast message keys in en and pt-BR', () => {
    const missing: string[] = []
    for (const path of TOAST_KEY_PATHS) {
      if (typeof get(en, path) !== 'string') missing.push(`en:${path}`)
      if (typeof get(pt, path) !== 'string') missing.push(`pt-BR:${path}`)
    }
    expect(missing, missing.join('\n')).toEqual([])
  })
})
