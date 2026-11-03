import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, getRebirth } from '../../domain/gameData'
import { evaluateRequirements } from '../../domain/requirements'
import { unitsNewlySellableAfterRebirth } from '../../domain/rebirthSellPlan'
import { formatTierName } from '../../domain/tiers'
import { useTierLabels } from '../../i18n/useTierLabels'
import type { InventoryUnit, TierId } from '../../domain/types'
import { DroidImage } from '../DroidImage'
import { RequirementInventoryControls } from '../RequirementInventoryControls'
import { ScreenSection } from '../layout/ScreenSection'
import { InsetGroup } from '../ui/InsetGroup'
import { SellBadge } from '../ui/SellBadge'

function ownedFor(
  inventory: InventoryUnit[],
  droidId: string,
  tier: TierId,
  trackInventory: boolean,
) {
  if (!trackInventory) return 0
  return inventory
    .filter((u) => u.droidId === droidId && u.tier === tier)
    .reduce((s, u) => s + u.quantity, 0)
}

export function ProgressUnifiedRebirthPanel({
  pathId,
  rebirth,
  inventory,
  trackInventory,
  onOpenDroid,
}: {
  pathId: string
  rebirth: number
  inventory: InventoryUnit[]
  trackInventory: boolean
  onOpenDroid: (droidId: string, tier: TierId, sellable: boolean, qty?: number) => void
}) {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const entry = getRebirth(pathId, rebirth)
  const sellExtras = useMemo(
    () => unitsNewlySellableAfterRebirth(pathId, rebirth),
    [pathId, rebirth],
  )

  if (!entry) return null

  const checks = evaluateRequirements(entry.requirements, inventory, trackInventory)
  const reqKeys = new Set(checks.map((c) => `${c.requirement.droidId}:${c.requirement.rarity}`))

  return (
    <ScreenSection testId="progress-unified-section">
      <h2 className="dc-section-header">
        {t('progress.listRebirthHeading', { n: rebirth })}
      </h2>
      <InsetGroup testId="progress-unified-group">
        {checks.map((c) => {
          const d = droidById.get(c.requirement.droidId)
          if (!d) return null
          const tier = c.requirement.rarity
          const owned = ownedFor(inventory, c.requirement.droidId, tier, trackInventory)
          const needed = c.requirement.quantity
          const sellable = false
          const subMeta = `${formatTierName(tier, tierLabels)} · ${owned}/${needed}`
          return (
            <div
              key={c.requirement.droidId}
              className="dc-row dc-row-droid"
              role="button"
              tabIndex={0}
              onClick={() => onOpenDroid(c.requirement.droidId, tier, sellable, owned)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenDroid(c.requirement.droidId, tier, sellable, owned)
                }
              }}
            >
              <DroidImage droid={d} tier={tier} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
              <div className="dc-row-main">
                <span className="dc-droid-name dc-row-label">{d.name}</span>
                <span className="dc-row-sub dc-row-sub--badge">
                  <span className="dc-row-sub-meta">{subMeta}</span>
                  <SellBadge sellable={sellable} />
                </span>
              </div>
              {trackInventory ? (
                <RequirementInventoryControls
                  droidId={c.requirement.droidId}
                  droidName={d.name}
                  tier={tier}
                  ownedCount={owned}
                  neededCount={needed}
                />
              ) : null}
            </div>
          )
        })}
        {sellExtras
          .filter((u) => !reqKeys.has(`${u.droidId}:${u.tier}`))
          .map((u) => {
            const d = droidById.get(u.droidId)
            if (!d) return null
            const sellable = u.disposition === 'sellable'
            const subMeta = `${formatTierName(u.tier, tierLabels)} · ${t('progress.qtyShort', { n: u.quantity })}`
            return (
              <div
                key={`${u.droidId}-${u.tier}`}
                className="dc-row dc-row-droid"
                role="button"
                tabIndex={0}
                onClick={() => onOpenDroid(u.droidId, u.tier, sellable, u.quantity)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpenDroid(u.droidId, u.tier, sellable, u.quantity)
                  }
                }}
              >
                <DroidImage droid={d} tier={u.tier} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
                <div className="dc-row-main">
                  <span className="dc-droid-name dc-row-label">{d.name}</span>
                  <span className="dc-row-sub dc-row-sub--badge">
                    <span className="dc-row-sub-meta">{subMeta}</span>
                    <SellBadge sellable={sellable} />
                  </span>
                </div>
              </div>
            )
          })}
      </InsetGroup>
    </ScreenSection>
  )
}
