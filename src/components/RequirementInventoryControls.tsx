import { Plus, X } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { useProgressInventoryToast } from '../hooks/useProgressInventoryToast'
import { useAppStore } from '../store/useAppStore'
import { uiIconProps } from './ui/iconStyle'
import { cn } from '../lib/utils'

const TAP = 'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl transition-colors'

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

  if (!showPlus && !showRemove) return null

  return (
    <div
      data-testid="requirement-inventory-actions"
      className="flex shrink-0 items-center gap-0.5"
    >
      {showPlus ? (
        <button
          type="button"
          data-testid="requirement-inventory-add"
          aria-label={addLabel}
          onClick={() => adjust(1)}
          className={cn(TAP, 'text-ui-accent hover:bg-ui-hover')}
        >
          <Plus {...uiIconProps} />
        </button>
      ) : null}
      {showRemove ? (
        <button
          type="button"
          data-testid="requirement-inventory-remove"
          aria-label={removeLabel}
          onClick={() => adjust(-1)}
          className={cn(
            TAP,
            'text-ui-muted hover:bg-ui-hover hover:text-ui-fg',
            !showPlus && 'border border-ui-subtle bg-ui-field/60',
          )}
        >
          <X {...uiIconProps} />
        </button>
      ) : null}
    </div>
  )
}
