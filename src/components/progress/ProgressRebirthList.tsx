import { ArrowsIn, ArrowsOut } from '@phosphor-icons/react'
import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getRebirth } from '../../domain/gameData'
import { evaluateRequirements, metRequirementCount } from '../../domain/requirements'
import { useProgressListExpansion } from '../../hooks/useProgressListExpansion'
import type { InventoryUnit } from '../../domain/types'
import { SellAfterRebirthList } from '../SellAfterRebirthList'
import { RequirementCard } from '../RequirementCard'
import { Badge } from '../ui/Badge'
import { GlassCard } from '../ui/GlassCard'
import { ProgressBar } from '../ui/ProgressBar'
import { uiIconProps } from '../ui/iconStyle'
import { CaretDown } from '@phosphor-icons/react'
import { useAppStore } from '../../store/useAppStore'

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
  const entry = getRebirth(pathId, rebirth)
  if (!entry) return null
  const done = rebirth < nextRebirth
  const checks = evaluateRequirements(entry.requirements, inventory, trackInventory)

  return (
    <GlassCard
      id={`progress-step-${rebirth}`}
      data-highlighted={highlighted ? 'true' : undefined}
      className={
        highlighted
          ? 'ring-2 ring-holo-400/70 bg-holo-500/10 transition-colors duration-500'
          : active
            ? 'ring-1 ring-holo-400/40'
            : ''
      }
    >
      <button
        type="button"
        className="w-full flex items-center gap-3 text-left"
        aria-expanded={open}
        onClick={onToggle}
        data-testid={`progress-list-item-${rebirth}`}
      >
        <CaretDown
          {...uiIconProps}
          className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            {t('progress.listRebirthHeading', { n: rebirth })}{' '}
            {done ? <Badge tone="success">{t('progress.listDone')}</Badge> : null}
            {active ? <Badge tone="info">{t('progress.listCurrent')}</Badge> : null}
          </p>
          <p className="text-xs text-ui-soft">{entry.credits}</p>
        </div>
        {trackInventory && !done ? (
          <span className="text-xs text-ui-muted shrink-0">
            {metRequirementCount(checks)}/3 {t('dashboard.statsReady').toLowerCase()}
          </span>
        ) : done ? (
          <span className="text-xs text-ui-success shrink-0">{t('progress.listCompletedState')}</span>
        ) : null}
      </button>
      {open ? (
        <div className="mt-3 space-y-2 border-t border-ui pt-3">
          {entry.note ? <p className="text-xs text-ui-warn/90">{entry.note}</p> : null}
          {!done && checks.map((c) => <RequirementCard key={c.requirement.droidId} check={c} />)}
          {!done && trackInventory ? (
            <ProgressBar value={(metRequirementCount(checks) / 3) * 100} />
          ) : null}
          {done ? (
            <SellAfterRebirthList pathId={pathId} afterRebirth={rebirth} compact />
          ) : (
            <SellAfterRebirthList pathId={pathId} afterRebirth={rebirth} />
          )}
        </div>
      ) : null}
    </GlassCard>
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

  const { isExpanded, toggleOne, toggleAll, allExpanded, expandOne } = useProgressListExpansion(
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

  const toggleLabel = allExpanded ? t('progress.collapseAll') : t('progress.expandAll')
  const toggleAria = allExpanded ? t('progress.collapseAllAria') : t('progress.expandAllAria')

  return (
    <div className="space-y-2" data-testid="progress-rebirth-list">
      <div className="flex justify-end">
        <button
          type="button"
          data-testid="progress-list-expand-all"
          aria-expanded={allExpanded}
          aria-label={toggleAria}
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-ui bg-ui-hover/80 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-ui-secondary hover:bg-ui-hover-strong hover:text-ui-fg transition-colors min-h-9"
        >
          {allExpanded ? (
            <ArrowsIn {...uiIconProps} weight="fill" className="size-4 shrink-0" />
          ) : (
            <ArrowsOut {...uiIconProps} weight="fill" className="size-4 shrink-0" />
          )}
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
    </div>
  )
}
