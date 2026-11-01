import { Plus } from '@phosphor-icons/react'
import { uiIconProps } from './ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { droidById } from '../domain/gameData'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import type { RequirementCheck } from '../domain/requirements'
import { useAppStore } from '../store/useAppStore'
import { DroidImage } from './DroidImage'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { GlassCard } from './ui/GlassCard'

const statusTone: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'default'> = {
  ready: 'success',
  owned: 'warn',
  missing: 'danger',
  keep: 'info',
  sellable: 'default',
  upgrade: 'warn',
}

export function RequirementCard({ check }: { check: RequirementCheck }) {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const markOwned = useAppStore((s) => s.markDroidOwned)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const droid = droidById.get(check.requirement.droidId)
  if (!droid) return null

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
      {trackInventory && check.status !== 'ready' ? (
        <Button
          variant="secondary"
          className="shrink-0 px-3"
          onClick={() => markOwned(check.requirement.droidId, check.requirement.rarity)}
          aria-label={t('a11y.markOwned', { name: droid.name })}
        >
          <Plus {...uiIconProps} />
        </Button>
      ) : null}
    </GlassCard>
  )
}
