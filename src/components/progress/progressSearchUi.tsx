import { useTranslation } from 'react-i18next'
import { cycleNumberFromPathId, rebirthNeedStatus, type ProgressDroidNeedHit } from '../../domain/progressDroidSearch'
import type { ProgressState } from '../../domain/progress'
import { formatTierName } from '../../domain/tiers'
import type { Droid, TierId } from '../../domain/types'
import { cn } from '../../lib/utils'
import { DroidImage } from '../DroidImage'
import { useAppStore } from '../../store/useAppStore'

export type NeedBadgeKind = 'here' | 'next' | 'done'

export function needBadgeKind(
  hit: ProgressDroidNeedHit,
  progress: ProgressState,
): NeedBadgeKind | null {
  const status = rebirthNeedStatus(hit.pathId, hit.rebirth, progress)
  if (status === 'current') return 'here'
  if (status === 'done') return 'done'
  if (status === 'upcoming') return 'next'
  return null
}

export function TierChip({ tier, label }: { tier: TierId | string; label: string }) {
  return (
    <span className="tier-chip" data-tier={tier}>
      {label}
    </span>
  )
}

function StatusIcon({ kind }: { kind: NeedBadgeKind }) {
  if (kind === 'here') {
    return (
      <svg className="ic" width={12} height={12} viewBox="0 0 24 24" aria-hidden>
        <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    )
  }
  if (kind === 'next') {
    return (
      <svg className="ic" width={12} height={12} viewBox="0 0 24 24" aria-hidden>
        <path d="M6 21V3.5" />
        <path d="M6 4.5h12l-2.5 4 2.5 4H6" />
      </svg>
    )
  }
  return (
    <svg className="ic" width={12} height={12} viewBox="0 0 24 24" aria-hidden>
      <path d="m4.5 12.5 5 5L19.5 7" />
    </svg>
  )
}

export function NeedStatusTag({ kind }: { kind: NeedBadgeKind }) {
  const { t } = useTranslation()
  const label =
    kind === 'here'
      ? t('progress.search.statusInYourRebirth')
      : kind === 'next'
        ? t('progress.search.statusNext')
        : t('progress.search.statusPassed')
  return (
    <span
      className={cn(
        'status-tag',
        kind === 'here' && 'status-tag--here',
        kind === 'next' && 'status-tag--next',
        kind === 'done' && 'status-tag--done',
      )}
    >
      <StatusIcon kind={kind} />
      {label}
    </span>
  )
}

export function SearchHitCard({
  droid,
  hit,
  tierLabels,
  highlighted,
  onPick,
  onHoldPointerDown,
}: {
  droid: Droid
  hit: ProgressDroidNeedHit | null
  tierLabels: Map<string, string>
  highlighted: boolean
  onPick: () => void
  onHoldPointerDown: () => void
}) {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const tier = hit?.tier ?? 'default'
  const tierLabel = formatTierName(tier, tierLabels)
  const qty = hit?.quantity ?? 1
  const badge = hit ? needBadgeKind(hit, progress) : null
  const statusLabel =
    badge === 'here'
      ? t('progress.search.statusInYourRebirth')
      : badge === 'next'
        ? t('progress.search.statusNext')
        : badge === 'done'
          ? t('progress.search.statusPassed')
          : ''

  const ariaLabel = hit
    ? t('progress.search.pickHitAria', {
        name: droid.name,
        n: hit.rebirth,
        tier: tierLabel,
        qty,
        status: statusLabel,
      })
  : t('progress.search.pickDroidName', { name: droid.name })

  return (
    <button
      type="button"
      role="option"
      className={cn('hit-card', highlighted && 'hit-card--here')}
      data-testid={`progress-search-pick-${droid.id}`}
      aria-label={ariaLabel}
      onPointerDown={onHoldPointerDown}
      onClick={onPick}
    >
      <span className="busca-thumb" aria-hidden>
        <DroidImage droid={droid} tier={tier} size="sm" />
      </span>
      <span className="row-main">
        <span className="hit-top">
          <span className="dname">{droid.name}</span>
          {hit ? <span className="hit-num">#{hit.rebirth}</span> : null}
        </span>
        {hit ? (
          <span className="hit-meta">
            <span className="tier-line">
              <TierChip tier={hit.tier} label={tierLabel} />
              <span className="need-qty">×{qty}</span>
            </span>
            {badge ? <NeedStatusTag kind={badge} /> : null}
          </span>
        ) : null}
      </span>
    </button>
  )
}

export function NeedRowCompact({
  hit,
  tierLabels,
  featured,
  showBadge,
  onGo,
  onHoldPointerDown,
  testId,
}: {
  hit: ProgressDroidNeedHit
  tierLabels: Map<string, string>
  featured?: boolean
  showBadge?: boolean
  onGo: () => void
  onHoldPointerDown: () => void
  testId?: string
}) {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const tierLabel = formatTierName(hit.tier, tierLabels)
  const ciclo = cycleNumberFromPathId(hit.pathId)
  const badge = showBadge ? needBadgeKind(hit, progress) : null
  const status = rebirthNeedStatus(hit.pathId, hit.rebirth, progress)

  const rowClass = cn(
    'need-row',
    featured && status === 'current' && 'need-row--here',
    featured && status === 'upcoming' && 'need-row--next',
    badge === 'done' && 'need-row--done',
  )

  const statusLabel =
    badge === 'here'
      ? t('progress.search.statusInYourRebirth')
      : badge === 'next'
        ? t('progress.search.statusNext')
        : badge === 'done'
          ? t('progress.search.statusPassed')
          : ''

  const ariaLabel =
    badge != null
      ? t('progress.search.openStepDetailAria', {
          n: hit.rebirth,
          tier: tierLabel,
          qty: hit.quantity,
          status: statusLabel,
        })
      : t('progress.search.openStepAria', { ciclo, n: hit.rebirth })

  return (
    <button
      type="button"
      className={rowClass}
      data-testid={testId ?? `progress-search-hit-${hit.pathId}-${hit.rebirth}`}
      aria-label={ariaLabel}
      onPointerDown={onHoldPointerDown}
      onClick={onGo}
    >
      <span className="need-num">#{hit.rebirth}</span>
      <span className="tier-line">
        <TierChip tier={hit.tier} label={tierLabel} />
        <span className="need-qty">×{hit.quantity}</span>
      </span>
      {badge ? <NeedStatusTag kind={badge} /> : null}
    </button>
  )
}

export function CycleSummaryCard({
  pathId,
  hits,
  cycleLabel,
  expanded,
  onToggle,
}: {
  pathId: string
  hits: ProgressDroidNeedHit[]
  cycleLabel: string
  expanded: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const rebirthCount = new Set(hits.map((h) => h.rebirth)).size
  const ciclo = cycleNumberFromPathId(pathId)

  return (
    <button
      type="button"
      className="cycle-card"
      data-testid={`progress-search-path-summary-${pathId}`}
      aria-expanded={expanded}
      aria-label={t('progress.search.cycleSummary', { ciclo, count: rebirthCount })}
      onClick={onToggle}
    >
      <span className="dname">{cycleLabel}</span>
      <span className="mini-tiers">
        {hits.map((h) => (
          <span key={`${h.rebirth}-${h.tier}`} className="mini-chip" data-tier={h.tier}>
            #{h.rebirth}
          </span>
        ))}
      </span>
    </button>
  )
}
