import { useTranslation } from 'react-i18next'
import { droidById } from '../domain/gameData'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import type { RequirementCheck } from '../domain/requirements'
import { useAppStore } from '../store/useAppStore'
import { DroidImage } from './DroidImage'
import { RequirementInventoryControls } from './RequirementInventoryControls'
import { Badge } from './ui/Badge'
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

  const showControls = trackInventory && (check.status !== 'ready' || check.ownedCount > 0)

  return (
    <GlassCard className="flex gap-3 items-center">
      <DroidImage droid={droid} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{droid.name}</p>
          <Badge tone="info">{formatTierName(check.requirement.rarity, tierLabels)}</Badge>
          {trackInventory ? (
            <Badge tone={statusTone[check.status] ?? 'default'}>{t(`status.${check.status}`)}</Badge>
          ) : null}
        </div>
        {trackInventory ? (
          <p className="text-xs text-ui-muted mt-1">
            {t('inventory.inInventory', {
              owned: check.ownedCount,
              needed: check.neededCount,
            })}
          </p>
        ) : null}
      </div>
      {showControls ? (
        <RequirementInventoryControls
          droidId={check.requirement.droidId}
          droidName={droid.name}
          tier={check.requirement.rarity}
          ownedCount={check.ownedCount}
          neededCount={check.neededCount}
          showDecrement={check.ownedCount > 0}
          allowIncrement={check.status !== 'ready'}
        />
      ) : null}
    </GlassCard>
  )
}
