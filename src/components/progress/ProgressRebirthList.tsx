import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, getRebirth } from '../../domain/gameData'
import { evaluateRequirements, metRequirementCount } from '../../domain/requirements'
import { unitsNewlySellableAfterRebirth } from '../../domain/rebirthSellPlan'
import { formatTierName } from '../../domain/tiers'
import { useTierLabels } from '../../i18n/useTierLabels'
import { useProgressListExpansion } from '../../hooks/useProgressListExpansion'
import type { InventoryUnit, TierId } from '../../domain/types'
import { DroidImage } from '../DroidImage'
import { RequirementInventoryControls } from '../RequirementInventoryControls'
import { InsetGroup } from '../ui/InsetGroup'
import { ProgressBar } from '../ui/ProgressBar'
import { SellBadge } from '../ui/SellBadge'
import { useAppStore } from '../../store/useAppStore'
import { ScreenSection } from '../layout/ScreenSection'
import { cn } from '../../lib/utils'

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
  highlighted: boolean
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
  highlighted,
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
    <div
      id={`progress-step-${rebirth}`}
      data-highlighted={highlighted ? 'true' : undefined}
      className={cn(
        highlighted && 'ring-2 ring-[var(--ui-accent-fill)]/50 rounded-xl',
        active && !highlighted && 'ring-1 ring-[var(--ui-accent-fill)]/30 rounded-xl',
      )}
    >
    <InsetGroup>
      <button
        type="button"
        className="dc-row dc-row-chevron w-full"
        aria-expanded={open}
        onClick={onToggle}
        data-testid={`progress-list-item-${rebirth}`}
      >
        <div className="dc-row-main">
          <span className="dc-row-label">
            {t('progress.listRebirthHeading', { n: rebirth })}
            {done ? ` · ${t('progress.listDone')}` : ''}
            {active ? ` · ${t('progress.listCurrent')}` : ''}
          </span>
          <span className="dc-row-sub">{entry.credits}</span>
        </div>
        {trackInventory && !done ? (
          <span className="dc-row-trail text-xs text-ui-muted shrink-0">
            {metRequirementCount(checks)}/3
          </span>
        ) : done ? (
          <span className="dc-row-trail text-xs text-ui-success shrink-0">
            {t('progress.listCompletedState')}
          </span>
        ) : null}
      </button>
      {open ? (
        <>
          {entry.note ? (
            <div className="dc-row">
              <span className="dc-row-sub text-ui-warn">{entry.note}</span>
            </div>
          ) : null}
          {!done &&
            checks.map((c) => {
              const d = droidById.get(c.requirement.droidId)
              if (!d) return null
              const tier = c.requirement.rarity
              const owned = ownedFor(inventory, c.requirement.droidId, tier, trackInventory)
              const needed = c.requirement.quantity
              const subMeta = `${formatTierName(tier, tierLabels)} · ${owned}/${needed}`
              return (
                <div key={c.requirement.droidId} className="dc-row dc-row-droid">
                  <DroidImage droid={d} tier={tier} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
                  <div className="dc-row-main">
                    <span className="dc-droid-name dc-row-label">{d.name}</span>
                    <span className="dc-row-sub dc-row-sub--badge">
                      <span className="dc-row-sub-meta">{subMeta}</span>
                      <SellBadge sellable={false} />
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
          {!done &&
            sellExtras
              .filter((u) => !reqKeys.has(`${u.droidId}:${u.tier}`))
              .map((u) => {
                const d = droidById.get(u.droidId)
                if (!d) return null
                const sellable = u.disposition === 'sellable'
                const subMeta = `${formatTierName(u.tier, tierLabels)} · ${t('progress.qtyShort', { n: u.quantity })}`
                return (
                  <div key={`${u.droidId}-${u.tier}`} className="dc-row dc-row-droid">
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
          {!done && trackInventory ? (
            <div className="px-4 pb-3">
              <ProgressBar value={(metRequirementCount(checks) / 3) * 100} />
            </div>
          ) : null}
        </>
      ) : null}
    </InsetGroup>
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
  const persisted = listAllExpanded !== false

  const { isExpanded, toggleOne, toggleAll, anyExpanded, expandOne } =
    useProgressListExpansion(
    rebirthNumbers,
    pathId,
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

  const toggleLabel = anyExpanded ? t('progress.collapseAll') : t('progress.expandAll')
  const toggleAria = anyExpanded ? t('progress.collapseAllAria') : t('progress.expandAllAria')

  return (
    <ScreenSection testId="progress-rebirth-list">
      <div className="dc-section-header-row">
        <h2 className="dc-section-header">{t('progress.rebirthListSection')}</h2>
        <button
          type="button"
          data-testid="progress-list-expand-all"
          aria-expanded={anyExpanded}
          aria-label={toggleAria}
          onClick={toggleAll}
          className="dc-section-header-action"
        >
          {toggleLabel}
        </button>
      </div>
      {rebirthNumbers.map((rebirth) => (
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
          highlighted={highlightRebirth === rebirth}
        />
      ))}
    </ScreenSection>
  )
}
