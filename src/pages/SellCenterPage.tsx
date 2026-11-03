import { useMemo } from 'react'
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
import { InsetGroup } from '../components/ui/InsetGroup'
import { SellBadge } from '../components/ui/SellBadge'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { uiIconProps } from '../components/ui/iconStyle'
import { useAppStore } from '../store/useAppStore'

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

  const renderItemRow = (
    item: (typeof items)[number],
    idx: number,
    sellableHint: boolean,
  ) => {
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
    const sellable = sellableHint && plan?.disposition === 'sellable'
    return (
      <div key={`${item.unitId}-${idx}`} className="dc-row dc-row-droid">
        <DroidImage droid={droid} tier={item.tier} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
        <div className="dc-row-main">
          <span className="dc-droid-name dc-row-label">{name}</span>
          <span className="dc-row-sub dc-row-sub--badge">
            <span className="dc-row-sub-meta">
              {formatTierName(item.tier, tierLabels)} · ×{item.quantity}
            </span>
            <SellBadge sellable={sellable} />
          </span>
          <span className="dc-row-sub">{reason}</span>
          {plan?.disposition === 'fusionHold' ? (
            <span className="dc-row-sub text-ui-warn">{t('sellAfter.fusionHold')}</span>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <TabScrollLayout title={t('sell.title')} testId="sell-page">
      <InsetGroup footer={t('sell.intro', { from: progress.nextRebirth, cycle: cycleName })}>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.path')}</span>
            <span className="dc-row-sub">
              <PathProgressSwitcher compact />
            </span>
          </div>
        </div>
      </InsetGroup>

      {allEmpty ? (
        <InsetGroup data-testid="sell-empty-state">
          <div className="dc-row">
            <Package {...uiIconProps} className="shrink-0 text-ui-accent" />
            <div className="dc-row-main">
              <span className="dc-row-label">{t('sell.emptyStateTitle')}</span>
              <span className="dc-row-sub">{t('sell.emptyStateBody')}</span>
            </div>
          </div>
          <Link to="/inventory" className="dc-row dc-row-chevron">
            <span className="dc-row-label">{t('sell.emptyStateCta')}</span>
          </Link>
        </InsetGroup>
      ) : (
        <>
          {safeNow.length > 0 ? (
            <section data-testid="sell-center-safe-now">
              <h2 className="dc-section-header">{t('sell.safeNowTitle')}</h2>
              <InsetGroup footer={t('sell.safeNowHint', { rebirth: completedRebirth })}>
                {safeNow.map(({ item }, idx) => renderItemRow(item, idx, true))}
              </InsetGroup>
            </section>
          ) : null}

          {(['keep', 'upgrade', 'sellable'] as const).map((cat) => {
            if (groups[cat].length === 0) return null
            return (
              <section key={cat}>
                <h2 className="dc-section-header">{t(`sell.${cat}`)}</h2>
                <InsetGroup>
                  {groups[cat].map((item, idx) =>
                    renderItemRow(item, idx, cat === 'sellable'),
                  )}
                </InsetGroup>
              </section>
            )
          })}
        </>
      )}

      <div className="dc-scroll-spacer" aria-hidden />
    </TabScrollLayout>
  )
}
