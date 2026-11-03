import { Minus, Plus } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { useProgressInventoryToast } from '../hooks/useProgressInventoryToast'
import { useAppStore } from '../store/useAppStore'
import { uiIconProps } from './ui/iconStyle'
import { cn } from '../lib/utils'

const STEPPER_WIDTH = 'w-[8.75rem]'

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
  const incLabel = t('progress.inventoryAddOne', { name: droidName, tier: tierLabel })
  const decLabel = t('progress.inventoryRemoveOne', { name: droidName, tier: tierLabel })

  const adjust = (delta: number) => {
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
    }, { name: droidName, tier: tierLabel, delta: delta > 0 ? 1 : -1 })
  }

  return (
    <div
      data-testid="requirement-inventory-stepper"
      className={cn(
        'flex shrink-0 items-center justify-between gap-0.5 rounded-xl border border-ui bg-ui-field/80 p-0.5',
        STEPPER_WIDTH,
      )}
    >
      <button
        type="button"
        data-testid="requirement-inventory-dec"
        aria-label={decLabel}
        disabled={ownedCount <= 0}
        onClick={() => adjust(-1)}
        className={cn(
          'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg',
          'text-ui-fg hover:bg-ui-hover disabled:opacity-40 disabled:pointer-events-none transition-colors',
        )}
      >
        <Minus {...uiIconProps} />
      </button>
      <span
        className="flex-1 text-center text-sm font-semibold tabular-nums text-ui-fg"
        data-testid="requirement-inventory-count"
        aria-live="polite"
      >
        {ownedCount}/{neededCount}
      </span>
      <button
        type="button"
        data-testid="requirement-inventory-inc"
        aria-label={incLabel}
        onClick={() => adjust(1)}
        className={cn(
          'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg',
          'text-ui-fg hover:bg-ui-hover transition-colors',
        )}
      >
        <Plus {...uiIconProps} />
      </button>
    </div>
  )
}
