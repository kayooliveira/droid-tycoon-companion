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

export function useSuperRebirthConfirm() {
  const { t } = useTranslation()
  const { push } = useToast()
  const superRebirthAdvance = useAppStore((s) => s.superRebirthAdvance)
  const importState = useAppStore((s) => s.importState)
  const toPersisted = useAppStore((s) => s.toPersisted)

  const runSuperRebirth = useCallback(
    (
      nextCycleName: string,
      celebration?: SuperRebirthCelebrationPayload,
      onCelebration?: (payload: SuperRebirthCelebrationPayload) => void,
    ) => {
      const before = useAppStore.getState()
      const inventorySnapshot = cloneInventory(before.inventory)
      const hadInventory = inventorySnapshot.length > 0

      superRebirthAdvance()

      const payload = celebration
      if (payload && onCelebration) {
        onCelebration(payload)
      }

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
    },
    [importState, push, superRebirthAdvance, t, toPersisted],
  )

  return { runSuperRebirth }
}
