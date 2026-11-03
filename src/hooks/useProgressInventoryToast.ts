import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../components/ToastProvider'
import type { InventoryUnit } from '../domain/types'
import { useAppStore } from '../store/useAppStore'

const REPLACE_KEY = 'progress-inventory'

function cloneInventory(units: InventoryUnit[]): InventoryUnit[] {
  return units.map((u) => ({ ...u }))
}

export function useProgressInventoryToast() {
  const { t } = useTranslation()
  const { push } = useToast()
  const importState = useAppStore((s) => s.importState)
  const toPersisted = useAppStore((s) => s.toPersisted)
  const burstSnapshot = useRef<InventoryUnit[] | null>(null)
  const burstTimer = useRef<number | null>(null)

  const clearBurst = useCallback(() => {
    burstSnapshot.current = null
    if (burstTimer.current != null) {
      window.clearTimeout(burstTimer.current)
      burstTimer.current = null
    }
  }, [])

  const runWithUndoToast = useCallback(
    (apply: () => void) => {
      if (burstSnapshot.current == null) {
        burstSnapshot.current = cloneInventory(useAppStore.getState().inventory)
      }
      apply()
      const snapshot = burstSnapshot.current

      if (burstTimer.current != null) {
        window.clearTimeout(burstTimer.current)
      }
      burstTimer.current = window.setTimeout(() => {
        clearBurst()
      }, 4000)

      push(t('progress.inventoryUpdated'), {
        replaceKey: REPLACE_KEY,
        action: {
          label: t('progress.inventoryUndo'),
          onClick: () => {
            if (!snapshot) return
            const persisted = toPersisted()
            importState({ ...persisted, inventory: cloneInventory(snapshot) })
            clearBurst()
          },
        },
      })
    },
    [clearBurst, importState, push, t, toPersisted],
  )

  return { runWithUndoToast }
}
