import { useMemo } from 'react'
import { Package } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { analyzeSellCenter, type SellAnalysisItem } from '../domain/sellCenter'
import { cycleById, droidById } from '../domain/gameData'
import { inventorySafeToSellNow } from '../domain/rebirthSellPlan'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { DroidImage } from '../components/DroidImage'
import { SellBadge } from '../components/ui/SellBadge'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { MoreBackBar } from '../components/layout/MoreBackBar'
import { PathProgressSwitcher } from '../components/PathProgressSwitcher'
import { uiIconProps } from '../components/ui/iconStyle'
import { useAppStore } from '../store/useAppStore'
import type { TierId } from '../domain/types'

export function SellCenterPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const cycleName = formatCycleDisplayName(
    cycleById.get(progress.pathId)?.name ?? progress.pathId,
    i18n.language,
  )
  const items = useMemo(
    () => analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory),
    [inventory, progress.nextRebirth, progress.pathId],
  )
  const completedRebirth = Math.max(0, progress.nextRebirth - 1)

  const safeNow = useMemo(() => {
    return items
      .filter((i) => i.category === 'sellable')
      .map((item) => ({
        item,
        plan: inventorySafeToSellNow(progress.pathId, completedRebirth, item.droidId, item.tier),
      }))
      .filter(({ plan }) => plan?.disposition === 'sellable')
      .map(({ item }) => item)
  }, [completedRebirth, items, progress.pathId])

  const groups = useMemo(() => {
    return {
      useNext: items.filter((i) => i.category === 'useNext'),
      keep: items.filter((i) => i.category === 'keep'),
      sellable: items.filter((i) => i.category === 'sellable'),
      upgrade: items.filter((i) => i.category === 'upgrade'),
    }
  }, [items])

  const allEmpty =
    inventory.length === 0 &&
    safeNow.length === 0 &&
    groups.useNext.length === 0 &&
    groups.keep.length === 0 &&
    groups.sellable.length === 0 &&
    groups.upgrade.length === 0

  const localizeReasonParams = (params: Record<string, string | number>) => {
    const out = { ...params }
    if (typeof out.tier === 'string') {
      out.tier = formatTierName(out.tier as TierId, tierLabels)
    }
    return out
  }

  const renderAnalysisRow = (
    item: SellAnalysisItem,
    idx: number,
    safeNowLine = false,
  ) => {
    const droid = droidById.get(item.droidId)
    if (!droid) return null
    const plan = inventorySafeToSellNow(
      progress.pathId,
      completedRebirth,
      item.droidId,
      item.tier,
    )
    return (
      <div key={`${item.unitId}-${idx}`} className="item">
        <button type="button" className="item-open" aria-label={droid.name}>
          <DroidImage droid={droid} tier={item.tier} size="sm" />
          <span className="item-body">
            <span className="dname">{droid.name}</span>
            <span className="t-meta">
              {`${formatTierName(item.tier, tierLabels)} · ${t('progress.qtyShort', { n: item.quantity })}`}
            </span>
            {item.category === 'useNext' ? <SellBadge sellable /> : null}
            <span className="item-note">
              {t(
                safeNowLine ? 'sell.safeNowLine' : item.reasonKey,
                localizeReasonParams(item.reasonParams),
              )}
            </span>
            {plan?.disposition === 'fusionHold' ? (
              <span className="note-warn">{t('sellAfter.fusionHold')}</span>
            ) : null}
          </span>
        </button>
      </div>
    )
  }

  const renderSection = (
    titleKey: string,
    testId: string,
    rows: SellAnalysisItem[],
    footerKey?: string,
    headerHint?: string,
    safeNowLine = false,
  ) => {
    if (rows.length === 0) return null
    return (
      <section key={testId} className="sec" data-testid={testId}>
        <div className="sec-h">
          <h2 className="t-h2">{t(titleKey)}</h2>
          <span className="t-label" aria-hidden>
            {rows.length}
          </span>
        </div>
        {rows.map((item, idx) => renderAnalysisRow(item, idx, safeNowLine))}
        {headerHint ? (
          <p className="hint" style={{ marginTop: 8 }}>
            {headerHint}
          </p>
        ) : null}
        {footerKey ? (
          <p className="hint" style={{ marginTop: 8 }}>
            {t(footerKey)}
          </p>
        ) : null}
      </section>
    )
  }

  return (
    <TabScrollLayout title={t('sell.title')} testId="sell-page" backBar={<MoreBackBar />}>
      <p className="hint" style={{ marginTop: 6 }}>
        {t('sell.intro', { from: progress.nextRebirth, cycle: cycleName })}
      </p>

      <div style={{ marginTop: 12 }}>
        <PathProgressSwitcher compact />
      </div>

      {allEmpty ? (
        <div className="stack" data-testid="sell-empty-state">
          <div className="row">
            <Package {...uiIconProps} className="shrink-0 text-ui-accent" />
            <div className="row-main">
              <span className="row-title">{t('sell.emptyStateTitle')}</span>
              <span className="hint" style={{ display: 'block' }}>
                {t('sell.emptyStateBody')}
              </span>
            </div>
          </div>
          <Link to="/inventory" className="row row--link">
            <span className="row-title">{t('sell.emptyStateCta')}</span>
          </Link>
        </div>
      ) : (
        <>
          {renderSection(
            'sell.safeNowTitle',
            'sell-center-safe-now',
            safeNow,
            undefined,
            t('sell.safeNowHint', { rebirth: completedRebirth }),
            true,
          )}
          {renderSection('sell.useNext', 'sell-center-useNext', groups.useNext)}
          {renderSection('sell.keep', 'sell-center-keep', groups.keep, 'sell.keepGroupFooter')}
          {renderSection('sell.upgrade', 'sell-center-upgrade', groups.upgrade, 'sell.upgradeGroupFooter')}
          {renderSection('sell.sellable', 'sell-center-sellable', groups.sellable, 'sell.sellableGroupFooter')}
        </>
      )}

      <div aria-hidden />
    </TabScrollLayout>
  )
}
