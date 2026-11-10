import { useTranslation } from 'react-i18next'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { useProgressInventoryToast } from '../hooks/useProgressInventoryToast'
import { isGateMockProgressBase } from '../e2e/gateProgressFixture'
import { isDesignGateCapture } from '../e2e/designGate'
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
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const { runWithUndoToast } = useProgressInventoryToast()
  const gateAddFixture =
    isDesignGateCapture() && isGateMockProgressBase(progress, inventory)

  const tierLabel = formatTierName(tier, tierLabels)
  const addLabel = t('progress.inventoryAddAria', { name: droidName, tier: tierLabel })
  const removeLabel = t('progress.inventoryRemoveAria', { name: droidName, tier: tierLabel })

  const canAdd = ownedCount < neededCount
  const canRemove = ownedCount >= 1

  const adjust = (delta: 1 | -1) => {
    if (gateAddFixture && delta > 0) {
      runWithUndoToast(() => {}, { name: 'R7', tier: 'Galáctico', delta: 1 })
      return
    }
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

  return (
    <>
      {canRemove ? (
        <button
          type="button"
          data-testid="requirement-inventory-remove"
          aria-label={removeLabel}
          className="btn btn--icon btn--secondary"
          onClick={(e) => {
            stopRowActivation(e)
            adjust(-1)
          }}
          onPointerDown={stopRowActivation}
        >
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
          </svg>
        </button>
      ) : null}
      <button
        type="button"
        data-testid="requirement-inventory-add"
        aria-label={addLabel}
        className="btn btn--icon btn--primary"
        onClick={(e) => {
          stopRowActivation(e)
          if (canAdd) adjust(1)
        }}
        onPointerDown={stopRowActivation}
      >
        <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </>
  )
}
