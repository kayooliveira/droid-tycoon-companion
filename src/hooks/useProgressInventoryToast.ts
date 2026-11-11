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
    (
      apply: () => void,
      context: { name: string; tier: string; delta: 1 | -1 },
    ) => {
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

      const step = useAppStore.getState().progress.nextRebirth
      const message =
        context.delta > 0
          ? t('progress.inventoryAddedShort', { name: context.name })
          : t('progress.inventoryRemovedShort', { name: context.name })

      push(message, {
        variant: context.delta > 0 ? 'success' : 'info',
        detail: t('progress.rebirthStepDetail', { n: step }),
        replaceKey: REPLACE_KEY,
        action: {
          label: t('progress.inventoryUndo'),
          onClick: () => {
            if (!snapshot) return
            const persisted = toPersisted()
            importState({ ...persisted, inventory: cloneInventory(snapshot) })
            clearBurst()
            push(t('progress.inventoryRestored'), { variant: 'success' })
          },
        },
      })
    },
    [clearBurst, importState, push, t, toPersisted],
  )

  return { runWithUndoToast }
}
