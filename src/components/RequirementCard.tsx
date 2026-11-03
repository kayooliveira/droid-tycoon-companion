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

  const showStepper = trackInventory

  return (
    <GlassCard className="flex gap-3 items-center flex-nowrap">
      <DroidImage droid={droid} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-medium truncate min-w-0">{droid.name}</p>
          <Badge tone="info" className="shrink-0">
            {formatTierName(check.requirement.rarity, tierLabels)}
          </Badge>
          {trackInventory ? (
            <Badge tone={statusTone[check.status] ?? 'default'} className="shrink-0">
              {t(`status.${check.status}`)}
            </Badge>
          ) : null}
        </div>
      </div>
      {showStepper ? (
        <RequirementInventoryControls
          droidId={check.requirement.droidId}
          droidName={droid.name}
          tier={check.requirement.rarity}
          ownedCount={check.ownedCount}
          neededCount={check.neededCount}
        />
      ) : null}
    </GlassCard>
  )
}
