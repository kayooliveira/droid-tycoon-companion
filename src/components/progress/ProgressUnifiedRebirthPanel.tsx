import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, getRebirth } from '../../domain/gameData'
import { evaluateRequirements } from '../../domain/requirements'
import {
  isProgressRequirementSellable,
  unitsNewlySellableAfterRebirth,
} from '../../domain/rebirthSellPlan'
import { formatTierName } from '../../domain/tiers'
import { useTierLabels } from '../../i18n/useTierLabels'
import type { InventoryUnit, TierId } from '../../domain/types'
import { ProgressDroidRequirementRow } from './ProgressDroidRequirementRow'

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
    <section className="sec" data-testid="progress-unified-section">
      <div className="sec-h">
        <h2 className="t-h2">{t('progress.listRebirthHeading', { n: rebirth })}</h2>
        {entry.credits ? <span className="t-label">{t('pdf.credits')} {entry.credits}</span> : null}
      </div>
        {checks.map((c) => {
          const d = droidById.get(c.requirement.droidId)
          if (!d) return null
          const tier = c.requirement.rarity
          const owned = ownedFor(inventory, c.requirement.droidId, tier, trackInventory)
          const needed = c.requirement.quantity
          const subMeta = `${formatTierName(tier, tierLabels)} · ${owned}/${needed}`
          const sellable = isProgressRequirementSellable(
            pathId,
            c.requirement.droidId,
            tier,
            rebirth,
          )
          return (
            <ProgressDroidRequirementRow
              key={c.requirement.droidId}
              droid={d}
              tier={tier}
              subMeta={subMeta}
              sellable={sellable}
              owned={owned}
              needed={needed}
              trackInventory={trackInventory}
              onOpenDroid={() => onOpenDroid(c.requirement.droidId, tier, sellable, owned)}
            />
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
              <ProgressDroidRequirementRow
                key={`${u.droidId}-${u.tier}`}
                droid={d}
                tier={u.tier}
                subMeta={subMeta}
                sellable={sellable}
                owned={u.quantity}
                needed={0}
                trackInventory={false}
                onOpenDroid={() => onOpenDroid(u.droidId, u.tier, sellable, u.quantity)}
              />
            )
          })}
    </section>
  )
}
