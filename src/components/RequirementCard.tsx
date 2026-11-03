import { useTranslation } from 'react-i18next'
import { droidById } from '../domain/gameData'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import type { RequirementCheck } from '../domain/requirements'
import { useAppStore } from '../store/useAppStore'
import { DroidImage } from './DroidImage'
import { RequirementInventoryControls } from './RequirementInventoryControls'
import { Badge } from './ui/Badge'
import { TierBadge } from './ui/TierBadge'
import { tierCardAccentClass } from './ui/tierVisuals'
import { cn } from '../lib/utils'
import { GlassCard } from './ui/GlassCard'

const statusTone: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'default'> = {
  ready: 'success',
  owned: 'warn',
  missing: 'danger',
  keep: 'info',
  sellable: 'default',
  upgrade: 'warn',
}

export function RequirementCard({
  check,
  trackInventory: trackInventoryOverride,
}: {
  check: RequirementCheck
  trackInventory?: boolean
}) {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const trackFromStore = useAppStore((s) => s.settings.trackInventory)
  const trackInventory = trackInventoryOverride ?? trackFromStore
  const droid = droidById.get(check.requirement.droidId)
  if (!droid) return null

  const { ownedCount, neededCount } = check
  const showInventoryActions = trackInventory

  return (
    <GlassCard
      className={cn('flex gap-3 items-start', tierCardAccentClass(check.requirement.rarity))}
      data-testid="requirement-card"
    >
      <DroidImage droid={droid} tier={check.requirement.rarity} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 min-w-0">
          <p
            className="min-w-0 flex-1 font-medium line-clamp-2 text-pretty break-words leading-snug"
            data-testid="requirement-droid-name"
          >
            {droid.name}
          </p>
          {showInventoryActions ? (
            <RequirementInventoryControls
              droidId={check.requirement.droidId}
              droidName={droid.name}
              tier={check.requirement.rarity}
              ownedCount={ownedCount}
              neededCount={neededCount}
            />
          ) : null}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TierBadge tier={check.requirement.rarity} className="shrink-0">
            {formatTierName(check.requirement.rarity, tierLabels)}
          </TierBadge>
          {trackInventory ? (
            <>
              <span
                className="text-xs font-medium tabular-nums text-ui-muted shrink-0"
                data-testid="requirement-inventory-count"
              >
                {ownedCount}/{neededCount}
              </span>
              {check.status === 'ready' || check.status === 'missing' ? (
                <Badge tone={statusTone[check.status] ?? 'default'} className="shrink-0">
                  {t(`status.${check.status}`)}
                </Badge>
              ) : null}
            </>
          ) : (
            <Badge tone={statusTone[check.status] ?? 'default'} className="shrink-0">
              {t(`status.${check.status}`)}
            </Badge>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
