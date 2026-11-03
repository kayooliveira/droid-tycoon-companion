import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cycleById, droidById, gameData } from '../../domain/gameData'
import {
  canSellDroidEverywhere,
  collectDroidProgressNeeds,
  cycleNumberFromPathId,
  groupNeedsByPath,
  isDroidNeverNeededForProgress,
  nextUpcomingNeedRebirth,
  rebirthNeedStatus,
  type ProgressDroidNeedHit,
} from '../../domain/progressDroidSearch'
import { formatTierName } from '../../domain/tiers'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useTierLabels } from '../../i18n/useTierLabels'
import { cycleDisplayNameForId } from '../../lib/cycleLabel'
import { findMatchingDroids, pickBestDroidMatch } from '../../lib/droidNameMatch'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { DroidImage } from '../DroidImage'
import { Badge } from '../ui/Badge'
import { GlassCard } from '../ui/GlassCard'
import { IconButton } from '../ui/IconButton'
import { uiIconProps } from '../ui/iconStyle'

export type ProgressNavTarget = { pathId: string; rebirth: number }

type ProgressDroidSearchProps = {
  initialQuery?: string
  onNavigateToStep: (target: ProgressNavTarget) => void
}

export function ProgressDroidSearch({ initialQuery = '', onNavigateToStep }: ProgressDroidSearchProps) {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const [query, setQuery] = useState(initialQuery)

  const debouncedQuery = useDebouncedValue(query, 200)

  const matchedDroids = useMemo(() => {
    const q = debouncedQuery.trim()
    if (q.length < 1) return []
    return findMatchingDroids(q, gameData.droids, 6)
  }, [debouncedQuery])

  const selectedDroid = useMemo(() => {
    const q = debouncedQuery.trim()
    if (!q) return null
    return pickBestDroidMatch(q, gameData.droids)
  }, [debouncedQuery])

  const needs = useMemo(() => {
    if (!selectedDroid) return []
    return collectDroidProgressNeeds(selectedDroid.id)
  }, [selectedDroid])

  const grouped = useMemo(
    () => (needs.length ? groupNeedsByPath(needs, progress) : []),
    [needs, progress],
  )

  const nextHit = useMemo(
    () => (needs.length ? nextUpcomingNeedRebirth(needs, progress) : null),
    [needs, progress],
  )

  const neverNeeded = selectedDroid ? isDroidNeverNeededForProgress(selectedDroid.id) : false
  const sellable = selectedDroid ? canSellDroidEverywhere(selectedDroid.id) : false

  const cycleLabel = (pathId: string) =>
    cycleDisplayNameForId(pathId, cycleById.get(pathId)?.name ?? pathId, i18n.language)

  return (
    <GlassCard className="space-y-3" data-testid="progress-droid-search">
      <label className="sr-only" htmlFor="progress-droid-search-input">
        {t('progress.search.label')}
      </label>
      <div className="relative flex items-center gap-2">
        <MagnifyingGlass
          {...uiIconProps}
          weight="fill"
          className="absolute left-3 size-5 text-ui-muted pointer-events-none"
          aria-hidden
        />
        <input
          id="progress-droid-search-input"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('progress.search.placeholder')}
          aria-controls="progress-droid-search-results"
          aria-expanded={debouncedQuery.trim().length > 0}
          className="w-full rounded-xl bg-ui-field border border-ui pl-10 pr-11 py-3 text-base min-h-11 text-ui-fg placeholder:text-ui-muted"
          data-testid="progress-droid-search-input"
        />
        {query ? (
          <IconButton
            variant="soft"
            className="absolute right-1.5 shrink-0"
            label={t('progress.search.clear')}
            onClick={() => setQuery('')}
            data-testid="progress-droid-search-clear"
          >
            <X {...uiIconProps} weight="fill" />
          </IconButton>
        ) : null}
      </div>

      <div id="progress-droid-search-results" className="space-y-3">
        {debouncedQuery.trim().length > 0 && !selectedDroid ? (
          <p className="text-sm text-ui-muted" data-testid="progress-droid-search-empty">
            {t('progress.search.noMatch')}
          </p>
        ) : null}

        {selectedDroid && neverNeeded ? (
          <NeverNeededCard droid={selectedDroid} sellable={sellable} />
        ) : null}

        {selectedDroid && !neverNeeded ? (
          <div className="flex items-center gap-3">
            <DroidImage droid={selectedDroid} size="sm" />
            <div className="min-w-0">
              <p className="font-medium truncate">{selectedDroid.name}</p>
              <p className="text-xs text-ui-muted">{t('progress.search.needsSummary')}</p>
            </div>
          </div>
        ) : null}

        {matchedDroids.length > 1 && debouncedQuery.trim().length > 0 ? (
          <div className="flex flex-wrap gap-2" role="listbox" aria-label={t('progress.search.pickDroid')}>
            {matchedDroids.map((d) => (
              <button
                key={d.id}
                type="button"
                role="option"
                aria-selected={selectedDroid?.id === d.id}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs',
                  selectedDroid?.id === d.id
                    ? 'border-holo-400/50 bg-ui-hover-strong text-ui-fg'
                    : 'border-ui bg-ui-hover/60 text-ui-secondary hover:bg-ui-hover-strong',
                )}
                onClick={() => setQuery(d.name)}
              >
                <DroidImage droid={d} size="sm" className="!h-6 !w-6" />
                {d.name}
              </button>
            ))}
          </div>
        ) : null}

        {grouped.map(({ pathId, hits }) => (
          <section key={pathId} className="space-y-2" data-testid={`progress-search-path-${pathId}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ui-muted">
              {cycleLabel(pathId)}
              {pathId === progress.pathId ? (
                <span className="ml-2 normal-case font-medium text-ui-accent">
                  {t('progress.search.currentCycle')}
                </span>
              ) : null}
            </h3>
            <ul className="space-y-1.5">
              {hits.map((hit) => (
                <NeedRow
                  key={`${hit.pathId}-${hit.rebirth}-${hit.tier}-${hit.kind}-${hit.fusionId ?? ''}`}
                  hit={hit}
                  highlight={
                    nextHit?.pathId === hit.pathId &&
                    nextHit.rebirth === hit.rebirth &&
                    nextHit.tier === hit.tier &&
                    nextHit.kind === hit.kind
                  }
                  tierLabels={tierLabels}
                  onGo={() =>
                    onNavigateToStep({
                      pathId: hit.pathId,
                      rebirth: hit.rebirth,
                    })
                  }
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </GlassCard>
  )
}

function NeverNeededCard({
  droid,
  sellable,
}: {
  droid: NonNullable<ReturnType<typeof droidById.get>>
  sellable: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-3 items-start" data-testid="progress-droid-search-never">
      <DroidImage droid={droid} size="sm" />
      <div className="space-y-1 text-sm">
        <p className="font-medium">{t('progress.search.neverNeeded', { name: droid.name })}</p>
        {sellable ? (
          <p className="text-ui-muted text-xs">{t('progress.search.canSell')}</p>
        ) : (
          <p className="text-ui-muted text-xs">{t('progress.search.neverNeededHint')}</p>
        )}
      </div>
    </div>
  )
}

function NeedRow({
  hit,
  highlight,
  tierLabels,
  onGo,
}: {
  hit: ProgressDroidNeedHit
  highlight: boolean
  tierLabels: Map<string, string>
  onGo: () => void
}) {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const status = rebirthNeedStatus(hit.pathId, hit.rebirth, progress)

  const statusLabel =
    status === 'done'
      ? t('progress.search.statusDone')
      : status === 'current'
        ? t('progress.search.statusCurrent')
        : t('progress.search.statusUpcoming')

  const tierLabel = formatTierName(hit.tier, tierLabels)
  const fusionResult =
    hit.kind === 'fusion' && hit.fusionResultDroidId
      ? droidById.get(hit.fusionResultDroidId)?.name
      : null

  return (
    <li>
      <button
        type="button"
        onClick={onGo}
        data-testid={`progress-search-hit-${hit.pathId}-${hit.rebirth}`}
        className={cn(
          'w-full text-left rounded-xl border border-ui bg-ui-hover/50 px-3 py-2.5 text-sm hover:bg-ui-hover-strong transition-colors',
          highlight && 'ring-2 ring-holo-400/50 bg-holo-500/10',
        )}
      >
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <span className="font-medium">{t('progress.search.rebirthStep', { n: hit.rebirth })}</span>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={status === 'done' ? 'success' : status === 'current' ? 'info' : 'default'}>
              {statusLabel}
            </Badge>
            {highlight ? <Badge tone="warn">{t('progress.search.nextNeed')}</Badge> : null}
          </div>
        </div>
        <p className="text-xs text-ui-secondary mt-1">
          {hit.kind === 'fusion' && fusionResult
            ? t('progress.search.fusionLine', {
                tier: tierLabel,
                qty: hit.quantity,
                result: fusionResult,
              })
            : t('progress.search.requirementLine', { tier: tierLabel, qty: hit.quantity })}
          {hit.kind === 'disputed' ? ` · ${t('progress.search.disputed')}` : null}
        </p>
        <p className="text-[11px] text-ui-muted mt-1">
          {t('progress.search.openStep', {
            ciclo: cycleNumberFromPathId(hit.pathId),
            n: hit.rebirth,
          })}
        </p>
      </button>
    </li>
  )
}
