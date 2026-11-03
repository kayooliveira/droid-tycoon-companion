import { useMemo, type ReactNode } from 'react'
import { Package } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { analyzeSellCenter } from '../domain/sellCenter'
import { cycleById, droidById } from '../domain/gameData'
import { inventorySafeToSellNow } from '../domain/rebirthSellPlan'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { PathProgressSwitcher } from '../components/PathProgressSwitcher'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { uiIconProps } from '../components/ui/iconStyle'
import { useAppStore } from '../store/useAppStore'
import { PageScreen } from '../components/layout/PageScreen'
import { ScreenHero } from '../components/layout/ScreenHero'
import { SectionHeader } from '../components/ui/SectionHeader'

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard className="space-y-3">
      <SectionHeader title={title} />
      {children}
    </GlassCard>
  )
}

export function SellCenterPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const cycleName = formatCycleDisplayName(
    cycleById.get(progress.pathId)?.name ?? progress.pathId,
    i18n.language,
  )
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

  const allEmpty =
    inventory.length === 0 &&
    safeNow.length === 0 &&
    groups.keep.length === 0 &&
    groups.sellable.length === 0 &&
    groups.upgrade.length === 0

  return (
    <PageScreen testId="sell-page">
      <ScreenHero
        title={t('sell.title')}
        kicker={t('nav.sell')}
        description={t('sell.intro', { from: progress.nextRebirth, cycle: cycleName })}
      />
      <PathProgressSwitcher compact />

      {allEmpty ? (
        <GlassCard className="p-6 flex flex-col items-center text-center gap-3" data-testid="sell-empty-state">
          <Package {...uiIconProps} className="size-10 text-ui-accent" />
          <p className="text-sm font-medium">{t('sell.emptyStateTitle')}</p>
          <p className="text-xs text-ui-soft max-w-xs">{t('sell.emptyStateBody')}</p>
          <Link to="/inventory">
            <Button size="sm" icon={<Package {...uiIconProps} />}>
              {t('sell.emptyStateCta')}
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <>
          {safeNow.length > 0 ? (
            <section className="space-y-3" data-testid="sell-center-safe-now">
              <SectionCard title={t('sell.safeNowTitle')}>
                <p className="text-xs text-ui-soft -mt-1">{t('sell.safeNowHint', { rebirth: completedRebirth })}</p>
                <div className="space-y-2">
                  {safeNow.map(({ item }, idx) => {
                    const droid = droidById.get(item.droidId)
                    if (!droid) return null
                    return (
                      <div key={`safe-${item.unitId}-${idx}`} className="flex gap-3 rounded-xl bg-ui-hover p-3">
                        <DroidImage droid={droid} size="sm" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2 items-center">
                            <p className="font-medium text-sm">{droid.name}</p>
                            <Badge tone="info">{formatTierName(item.tier, tierLabels)}</Badge>
                            <Badge tone="success">×{item.quantity}</Badge>
                          </div>
                          <p className="text-xs text-ui-success/90 mt-1">{t('sell.safeNowLine')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </SectionCard>
            </section>
          ) : null}

          {(['keep', 'upgrade', 'sellable'] as const).map((cat) => {
            if (groups[cat].length === 0) return null
            return (
              <section key={cat}>
                <SectionCard title={t(`sell.${cat}`)}>
                  <div className="space-y-2">
                    {groups[cat].map((item, idx) => {
                      const droid = droidById.get(item.droidId)
                      if (!droid) return null
                      const name = droid.name
                      const reason =
                        item.category === 'upgrade' && item.upgradeTargetTier && item.nextNeededAtRebirth
                          ? t('sell.keepForUpgrade', {
                              tier: formatTierName(item.upgradeTargetTier, tierLabels),
                              rebirth: item.nextNeededAtRebirth,
                            })
                          : t(item.reasonKey, {
                              ...item.reasonParams,
                              name,
                              tier: item.upgradeTargetTier
                                ? formatTierName(item.upgradeTargetTier, tierLabels)
                                : item.reasonParams.tier,
                              defaultValue: item.reasonKey,
                            })
                      const plan = inventorySafeToSellNow(
                        progress.pathId,
                        completedRebirth,
                        item.droidId,
                        item.tier,
                      )
                      return (
                        <div key={`${item.unitId}-${idx}`} className="flex gap-3 rounded-xl bg-ui-hover p-3">
                          <DroidImage droid={droid} size="sm" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="font-medium text-sm">{name}</p>
                              <Badge tone="info">{formatTierName(item.tier, tierLabels)}</Badge>
                              <Badge>×{item.quantity}</Badge>
                              {plan?.disposition === 'fusionHold' ? (
                                <Badge tone="warn">{t('sellAfter.fusionHold')}</Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-ui-muted mt-1">{reason}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </SectionCard>
              </section>
            )
          })}
        </>
      )}
    </PageScreen>
  )
}
