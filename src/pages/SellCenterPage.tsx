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
import { MoreBackBar } from '../components/layout/MoreBackBar'
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
    useNext: items.filter((i) => i.category === 'useNext'),
    keep: items.filter((i) => i.category === 'keep'),
    sellable: items.filter((i) => i.category === 'sellable'),
    upgrade: items.filter((i) => i.category === 'upgrade'),
  }

  const allEmpty =
    inventory.length === 0 &&
    safeNow.length === 0 &&
    groups.useNext.length === 0 &&
    groups.keep.length === 0 &&
    groups.sellable.length === 0 &&
    groups.upgrade.length === 0

  const renderItemRow = (item: (typeof items)[number], idx: number) => {
    const droid = droidById.get(item.droidId)
    if (!droid) return null
    const plan = inventorySafeToSellNow(
      progress.pathId,
      completedRebirth,
      item.droidId,
      item.tier,
    )
    return (
      <div key={`${item.unitId}-${idx}`} className="row item">
        <DroidImage droid={droid} tier={item.tier} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
        <div className="row-main">
          <span className="dname row-title">{droid.name}</span>
          <span className="row-sub row-sub--badge">
            <span className="row-sub-meta t-meta">
              {`${formatTierName(item.tier, tierLabels)} · ${t('progress.qtyShort', { n: item.quantity })}`}
            </span>
            {item.category === 'useNext' ? <SellBadge sellable /> : null}
          </span>
          <span className="hint">{t(item.reasonKey, item.reasonParams)}</span>
          {plan?.disposition === 'fusionHold' ? (
            <span className="hint text-ui-warn">{t('sellAfter.fusionHold')}</span>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <TabScrollLayout title={t('sell.title')} testId="sell-page" backBar={<MoreBackBar />}>
      <InsetGroup footer={t('sell.intro', { from: progress.nextRebirth, cycle: cycleName })}>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('settings.path')}</span>
            <span className="hint">
              <PathProgressSwitcher compact />
            </span>
          </div>
        </div>
      </InsetGroup>

      {allEmpty ? (
        <InsetGroup data-testid="sell-empty-state">
          <div className="row">
            <Package {...uiIconProps} className="shrink-0 text-ui-accent" />
            <div className="row-main">
              <span className="row-title">{t('sell.emptyStateTitle')}</span>
              <span className="hint">{t('sell.emptyStateBody')}</span>
            </div>
          </div>
          <Link to="/inventory" className="row row row--link">
            <span className="row-title">{t('sell.emptyStateCta')}</span>
          </Link>
        </InsetGroup>
      ) : (
        <>
          {safeNow.length > 0 ? (
            <section className="sec" data-testid="sell-center-safe-now">
              <h2 className="sec-h">{t('sell.safeNowTitle')}</h2>
              <InsetGroup footer={t('sell.safeNowHint', { rebirth: completedRebirth })}>
                {safeNow.map(({ item }, idx) => renderItemRow(item, idx))}
              </InsetGroup>
            </section>
          ) : null}

          {(['useNext', 'keep', 'upgrade', 'sellable'] as const).map((cat) => {
            if (groups[cat].length === 0) return null
            const footerKey =
              cat === 'keep' &&
              groups.keep.some((i) => (i.nextNeededAtRebirth ?? 0) > progress.nextRebirth)
                ? 'sell.keepGroupFooter'
                : cat === 'upgrade'
                  ? 'sell.upgradeGroupFooter'
                  : cat === 'sellable'
                    ? 'sell.sellableGroupFooter'
                    : undefined
            return (
              <section key={cat} className="sec" data-testid={`sell-center-${cat}`}>
                <h2 className="sec-h">{t(`sell.${cat}`)}</h2>
                <InsetGroup footer={footerKey ? t(footerKey) : undefined}>
                  {groups[cat].map((item, idx) => renderItemRow(item, idx))}
                </InsetGroup>
              </section>
            )
          })}
        </>
      )}

      <div aria-hidden />
    </TabScrollLayout>
  )
}
