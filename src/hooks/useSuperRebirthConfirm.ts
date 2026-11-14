import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../components/ToastProvider'
import type { InventoryUnit } from '../domain/types'
import { useAppStore } from '../store/useAppStore'

function cloneInventory(units: InventoryUnit[]): InventoryUnit[] {
  return units.map((u) => ({ ...u }))
}

export type SuperRebirthCelebrationPayload = {
  cycleNumber: number
  cycleName: string
}

export type RunSuperRebirthResult = {
  /** Call after celebration (or immediately when animation is off). */
  revealToast: () => void
}

export function useSuperRebirthConfirm() {
  const { t } = useTranslation()
  const { push } = useToast()
  const superRebirthAdvance = useAppStore((s) => s.superRebirthAdvance)
  const importState = useAppStore((s) => s.importState)
  const toPersisted = useAppStore((s) => s.toPersisted)

  const runSuperRebirth = useCallback(
    (
      nextCycleName: string,
      options?: {
        celebration?: SuperRebirthCelebrationPayload
        onCelebrateStart?: (
          payload: SuperRebirthCelebrationPayload,
          revealToast: () => void,
        ) => void
      },
    ): RunSuperRebirthResult => {
      const before = useAppStore.getState()
      const inventorySnapshot = cloneInventory(before.inventory)
      const hadInventory = inventorySnapshot.length > 0

      superRebirthAdvance()

      const revealToast = () => {
        push(t('path.switched', { name: nextCycleName }), {
          variant: 'info',
          durationMs: 12_000,
          action: hadInventory
            ? {
                label: t('progress.inventoryUndo'),
                onClick: () => {
                  const persisted = toPersisted()
                  importState({ ...persisted, inventory: cloneInventory(inventorySnapshot) })
                  push(t('progress.inventoryRestored'), { variant: 'success' })
                },
              }
            : undefined,
        })
      }

      if (options?.celebration && options.onCelebrateStart) {
        options.onCelebrateStart(options.celebration, revealToast)
        return { revealToast }
      }

      revealToast()
      return { revealToast }
    },
    [importState, push, superRebirthAdvance, t, toPersisted],
  )

  return { runSuperRebirth }
}
