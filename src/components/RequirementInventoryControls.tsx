import { useTranslation } from 'react-i18next'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { useProgressInventoryToast } from '../hooks/useProgressInventoryToast'
import { useAppStore } from '../store/useAppStore'

export function RequirementInventoryControls({
  droidId,
  droidName,
  tier,
  ownedCount,
  neededCount,
}: {
  droidId: string
  droidName: string
  tier: Parameters<typeof formatTierName>[0]
  ownedCount: number
  neededCount: number
}) {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const addInventoryUnit = useAppStore((s) => s.addInventoryUnit)
  const updateInventoryUnit = useAppStore((s) => s.updateInventoryUnit)
  const removeInventoryUnit = useAppStore((s) => s.removeInventoryUnit)
  const { runWithUndoToast } = useProgressInventoryToast()

  const tierLabel = formatTierName(tier, tierLabels)
  const addLabel = t('progress.inventoryAddAria', { name: droidName, tier: tierLabel })
  const removeLabel = t('progress.inventoryRemoveAria', { name: droidName, tier: tierLabel })

  const showPlus = ownedCount < neededCount
  const showRemove = ownedCount >= 1

  const adjust = (delta: 1 | -1) => {
    runWithUndoToast(() => {
      const unit = useAppStore
        .getState()
        .inventory.find((u) => u.droidId === droidId && u.tier === tier)
      if (delta > 0) {
        addInventoryUnit(droidId, tier, 1)
      } else if (unit) {
        if (unit.quantity <= 1) {
          removeInventoryUnit(unit.id)
        } else {
          updateInventoryUnit(unit.id, { quantity: unit.quantity - 1 })
        }
      }
    }, { name: droidName, tier: tierLabel, delta })
  }

  const stopRowActivation = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
  }

  if (!showPlus && !showRemove) return null

  return (
    <div
      data-testid="requirement-inventory-actions"
      className="row-val row2"
      onClick={stopRowActivation}
      onPointerDown={stopRowActivation}
    >
      {showPlus ? (
        <button
          type="button"
          data-testid="requirement-inventory-add"
          aria-label={addLabel}
          onClick={(e) => {
            stopRowActivation(e)
            adjust(1)
          }}
          onPointerDown={stopRowActivation}
          className="act-add"
        >
          +
        </button>
      ) : null}
      {showRemove ? (
        <button
          type="button"
          data-testid="requirement-inventory-remove"
          aria-label={removeLabel}
          onClick={(e) => {
            stopRowActivation(e)
            adjust(-1)
          }}
          onPointerDown={stopRowActivation}
          className="act-remove"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
