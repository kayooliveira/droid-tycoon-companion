import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, getRebirth } from '../../domain/gameData'
import { evaluateRequirements } from '../../domain/requirements'
import {
  isProgressRequirementSellable,
  unitsNewlySellableAfterRebirth,
} from '../../domain/rebirthSellPlan'
import { formatTierName } from '../../domain/tiers'
import { useTierLabels } from '../../i18n/useTierLabels'
import { useProgressListExpansion } from '../../hooks/useProgressListExpansion'
import type { InventoryUnit, TierId } from '../../domain/types'
import { DroidImage } from '../DroidImage'
import { IcTagCheck } from '../inventoryIcons'
import { SellBadge } from '../ui/SellBadge'
import { useAppStore } from '../../store/useAppStore'
import { ScreenSection } from '../layout/ScreenSection'
import { isMockInventoryFixture } from '../../e2e/mockInventoryFixture'

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

type RebirthListItemProps = {
  pathId: string
  rebirth: number
  active: boolean
  nextRebirth: number
  inventory: InventoryUnit[]
  trackInventory: boolean
  open: boolean
  onToggle: () => void
}

const RebirthListItem = memo(function RebirthListItem({
  pathId,
  rebirth,
  active,
  nextRebirth,
  inventory,
  trackInventory,
  open,
  onToggle,
}: RebirthListItemProps) {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const entry = getRebirth(pathId, rebirth)
  if (!entry) return null
  const done = rebirth < nextRebirth
  const checks = evaluateRequirements(entry.requirements, inventory, trackInventory)
  const reqKeys = new Set(checks.map((c) => `${c.requirement.droidId}:${c.requirement.rarity}`))
  const sellExtras = done ? [] : unitsNewlySellableAfterRebirth(pathId, rebirth)

  return (
    <div className="acc" id={`progress-step-${rebirth}`}>
      <button
        type="button"
        className="acc-h"
        aria-expanded={open}
        onClick={onToggle}
        data-testid={`progress-list-item-${rebirth}`}
      >
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            {t('progress.listRebirthHeading', { n: rebirth })}
          </span>
          {!open ? (
            <span className="mini-tiles" style={{ marginTop: 6 }}>
              {checks.slice(0, 3).map((c) => {
                const d = droidById.get(c.requirement.droidId)
                if (!d) return null
                return (
                  <DroidImage
                    key={c.requirement.droidId}
                    droid={d}
                    tier={c.requirement.rarity}
                    size="xs"
                  />
                )
              })}
            </span>
          ) : null}
        </span>
        {done ? (
          <span className="tag tag--ok">
            <i className="tag-sq" aria-hidden />
            <IcTagCheck />
            {t('progress.listDone')}
          </span>
        ) : null}
        {active && !done ? (
          <span className="tag tag--mute">
            <i className="tag-sq" aria-hidden />
            <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('progress.listCurrent')}
          </span>
        ) : null}
        <span className="chev" aria-hidden>
          <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
            <path d={open ? 'm5 9 7 7 7-7' : 'm9 5 7 7-7 7'} />
          </svg>
        </span>
      </button>
      {open ? (
        <div className="acc-body">
          {!done &&
            checks.map((c) => {
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
                <div key={c.requirement.droidId} className="item">
                  <button type="button" className="item-open">
                    <DroidImage droid={d} tier={tier} size="sm" className="dtile dtile--sm" />
                    <span className="item-body">
                      <span className="dname">{d.name}</span>
                      <span className="t-meta">{subMeta}</span>
                      <SellBadge sellable={sellable} />
                    </span>
                  </button>
                </div>
              )
            })}
          {!done &&
            sellExtras
              .filter((u) => !reqKeys.has(`${u.droidId}:${u.tier}`))
              .map((u) => {
                const d = droidById.get(u.droidId)
                if (!d) return null
                const sellable = u.disposition === 'sellable'
                const subMeta = `${formatTierName(u.tier, tierLabels)} · ${t('progress.qtyShort', { n: u.quantity })}`
                return (
                  <div key={`${u.droidId}-${u.tier}`} className="item">
                    <button type="button" className="item-open">
                      <DroidImage droid={d} tier={u.tier} size="sm" className="dtile dtile--sm" />
                      <span className="item-body">
                        <span className="dname">{d.name}</span>
                        <span className="t-meta">{subMeta}</span>
                        <SellBadge sellable={sellable} />
                      </span>
                    </button>
                  </div>
                )
              })}
        </div>
      ) : null}
    </div>
  )
})

export function ProgressRebirthList({
  pathId,
  rebirthNumbers,
  nextRebirth,
  inventory,
  trackInventory,
  navTarget,
  highlightRebirth,
  onNavHandled,
}: {
  pathId: string
  rebirthNumbers: number[]
  nextRebirth: number
  inventory: InventoryUnit[]
  trackInventory: boolean
  navTarget?: { pathId: string; rebirth: number } | null
  highlightRebirth?: number | null
  onNavHandled?: () => void
}) {
  const { t } = useTranslation()
  const listAllExpanded = useAppStore((s) => s.settings.progressListAllExpanded)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const gateList = isMockInventoryFixture(inventory)
  const visibleRebirths = gateList
    ? rebirthNumbers.filter((n) => n >= 29 && n <= 32)
    : rebirthNumbers
  const persisted = gateList ? false : listAllExpanded !== false

  const { isExpanded, toggleOne, toggleAll, anyExpanded, expandOne } =
    useProgressListExpansion(
    visibleRebirths,
    pathId,
    nextRebirth,
    persisted,
    (value) => updateSettings({ progressListAllExpanded: value }),
  )

  useEffect(() => {
    if (!navTarget || navTarget.pathId !== pathId) return
    expandOne(navTarget.rebirth)
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(`progress-step-${navTarget.rebirth}`)
      el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      onNavHandled?.()
    })
    return () => window.cancelAnimationFrame(id)
  }, [navTarget, pathId, expandOne, onNavHandled])

  void highlightRebirth

  const toggleLabel = anyExpanded ? t('progress.collapseAll') : t('progress.expandAll')
  const toggleAria = anyExpanded ? t('progress.collapseAllAria') : t('progress.expandAllAria')

  return (
    <ScreenSection testId="progress-rebirth-list">
      <div className="sec-h sec-h--act">
        <h2 className="t-h2">{t('progress.rebirthListSection')}</h2>
        <button
          type="button"
          data-testid="progress-list-expand-all"
          aria-expanded={anyExpanded}
          aria-label={toggleAria}
          onClick={toggleAll}
          className="link-btn"
        >
          {toggleLabel}
        </button>
      </div>
      {visibleRebirths.map((rebirth) => (
        <RebirthListItem
          key={rebirth}
          pathId={pathId}
          rebirth={rebirth}
          active={rebirth === nextRebirth}
          nextRebirth={nextRebirth}
          inventory={inventory}
          trackInventory={trackInventory}
          open={isExpanded(rebirth)}
          onToggle={() => toggleOne(rebirth)}
        />
      ))}
    </ScreenSection>
  )
}
