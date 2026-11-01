import { useTranslation } from 'react-i18next'
import { cycleById, droidById, getPathIds } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { unitsNewlySellableAfterRebirth, type RebirthUnitUsage } from '../domain/rebirthSellPlan'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { DroidImage } from './DroidImage'
import { Badge } from './ui/Badge'

function earliestOtherPathId(pathIds: string[]): string | null {
  const order = getPathIds()
  let best: string | null = null
  let bestIdx = Number.POSITIVE_INFINITY
  for (const id of pathIds) {
    const idx = order.indexOf(id)
    if (idx >= 0 && idx < bestIdx) {
      bestIdx = idx
      best = id
    }
  }
  return best
}

function UnitRow({ unit }: { unit: RebirthUnitUsage }) {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const pathLabel = (pathId: string) =>
    formatCycleDisplayName(cycleById.get(pathId)?.name ?? pathId, i18n.language)
  const droid = droidById.get(unit.droidId)
  if (!droid) return null

  const tone =
    unit.disposition === 'sellable'
      ? 'success'
      : unit.disposition === 'fusionHold'
        ? 'warn'
        : 'info'

  return (
    <li className="flex gap-2 items-center min-w-0">
      <DroidImage droid={droid} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-sm font-medium truncate">{droid.name}</span>
          <Badge tone="info">{formatTierName(unit.tier, tierLabels)}</Badge>
          {unit.quantity > 1 ? <Badge>×{unit.quantity}</Badge> : null}
          {unit.disposition !== 'sellable' ? (
            <Badge tone={tone}>{t(`sellAfter.${unit.disposition}`)}</Badge>
          ) : null}
        </div>
        {unit.otherPathIds.length > 0 ? (
          <p className="text-[11px] text-ui-soft mt-0.5">
            {(() => {
              const nextPath = earliestOtherPathId(unit.otherPathIds)
              return nextPath
                ? t('sellAfter.returnsOnCycle', { name: pathLabel(nextPath) })
                : null
            })()}
          </p>
        ) : null}
        {unit.disposition === 'fusionCaution' ? (
          <p className="text-[11px] text-ui-warn/80 mt-0.5">{t('sellAfter.fusionCautionHint')}</p>
        ) : null}
        {unit.upgradeHint ? (
          <p className="text-[11px] text-ui-soft mt-0.5">
            {t('sell.keepForUpgrade', {
              tier: formatTierName(unit.upgradeHint.targetTier, tierLabels),
              rebirth: unit.upgradeHint.rebirth,
            })}
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function SellAfterRebirthList({
  pathId,
  afterRebirth,
  compact,
}: {
  pathId: string
  afterRebirth: number
  compact?: boolean
}) {
  const { t } = useTranslation()
  const units = unitsNewlySellableAfterRebirth(pathId, afterRebirth).filter(
    (u) => u.disposition === 'sellable' || u.disposition === 'fusionHold' || u.disposition === 'fusionCaution',
  )
  const sellableOnly = units.filter((u) => u.disposition === 'sellable')

  if (units.length === 0) {
    return (
      <p className="text-xs text-ui-soft" data-testid="sell-after-empty">
        {t('sellAfter.none')}
      </p>
    )
  }

  return (
    <div className="space-y-2" data-testid="sell-after-list">
      <p className="text-xs font-medium text-ui-secondary">
        {t('sellAfter.heading')}
      </p>
      <ul className={`space-y-2 ${compact ? '' : 'rounded-xl border border-ui p-3 bg-ui-sunken'}`}>
        {(compact ? sellableOnly : units).map((u) => (
          <UnitRow key={u.unitKey} unit={u} />
        ))}
      </ul>
      {!compact && sellableOnly.length < units.length ? (
        <p className="text-[11px] text-ui-soft">{t('sellAfter.fusionNote')}</p>
      ) : null}
    </div>
  )
}
