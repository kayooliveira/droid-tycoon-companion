import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { analyzeSellCenter } from '../domain/sellCenter'
import { droidById } from '../domain/gameData'
import { inventorySafeToSellNow } from '../domain/rebirthSellPlan'
import { buildTierLabelMap, formatTierName } from '../domain/tiers'
import { gameData } from '../domain/gameData'
import { PathProgressSwitcher } from '../components/PathProgressSwitcher'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore } from '../store/useAppStore'

const tierLabels = buildTierLabelMap(gameData.rarities)

export function SellCenterPage() {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const items = analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory)
  const completedRebirth = Math.max(0, progress.nextRebirth - 1)

  const safeNow = useMemo(() => {
    return items
      .filter((i) => i.category === 'sellable')
      .map((item) => ({
        item,
        plan: inventorySafeToSellNow(progress.pathId, completedRebirth, item.droidId, item.tier),
      }))
      .filter(({ plan }) => plan?.disposition === 'sellable')
  }, [items, progress.pathId, completedRebirth])

  const groups = {
    keep: items.filter((i) => i.category === 'keep'),
    sellable: items.filter((i) => i.category === 'sellable'),
    upgrade: items.filter((i) => i.category === 'upgrade'),
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-display text-2xl tracking-wide">{t('sell.title')}</h1>
        <PathProgressSwitcher compact />
        <p className="text-sm text-zinc-400">{t('sell.intro', { from: progress.nextRebirth, path: progress.pathId })}</p>
      </div>

      {safeNow.length > 0 ? (
        <section className="space-y-3" data-testid="sell-center-safe-now">
          <h2 className="font-display text-lg">{t('sell.safeNowTitle')}</h2>
          <p className="text-xs text-zinc-500">{t('sell.safeNowHint', { rebirth: completedRebirth })}</p>
          {safeNow.map(({ item }, idx) => {
            const droid = droidById.get(item.droidId)
            if (!droid) return null
            return (
              <GlassCard key={`safe-${item.unitId}-${idx}`} className="flex gap-3">
                <DroidImage droid={droid} size="sm" />
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    <p className="font-medium">{droid.name}</p>
                    <Badge tone="info">{formatTierName(item.tier, tierLabels)}</Badge>
                    <Badge tone="success">×{item.quantity}</Badge>
                  </div>
                  <p className="text-sm text-emerald-300/90 mt-1">{t('sell.safeNowLine')}</p>
                </div>
              </GlassCard>
            )
          })}
        </section>
      ) : null}

      {(['keep', 'upgrade', 'sellable'] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="font-display text-lg">{t(`sell.${cat}`)}</h2>
          {groups[cat].length === 0 ? (
            <p className="text-sm text-zinc-500">{t('sell.emptyCategory')}</p>
          ) : (
            groups[cat].map((item, idx) => {
              const droid = droidById.get(item.droidId)
              if (!droid) return null
              const name = droid.name
              const reason = t(item.reasonKey, { ...item.reasonParams, name, defaultValue: item.reasonKey })
              const plan = inventorySafeToSellNow(
                progress.pathId,
                completedRebirth,
                item.droidId,
                item.tier,
              )
              return (
                <GlassCard key={`${item.unitId}-${idx}`} className="flex gap-3">
                  <DroidImage droid={droid} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-medium">{name}</p>
                      <Badge tone="info">{formatTierName(item.tier, tierLabels)}</Badge>
                      <Badge>×{item.quantity}</Badge>
                      {plan?.disposition === 'fusionHold' ? (
                        <Badge tone="warn">{t('sellAfter.fusionHold')}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{reason}</p>
                  </div>
                </GlassCard>
              )
            })
          )}
        </section>
      ))}
    </div>
  )
}
