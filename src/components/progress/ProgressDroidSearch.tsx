import { CaretRight } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cycleById, droidById, gameData } from '../../domain/gameData'
import {
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
import { SearchInput } from '../ui/SearchInput'
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
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({})

  const trimmedQuery = query.trim()
  const debouncedQuery = useDebouncedValue(trimmedQuery, 200)
  /** Cleared input hides results immediately; debounce only applies while typing. */
  const effectiveQuery = trimmedQuery.length === 0 ? '' : debouncedQuery

  const matchedDroids = useMemo(() => {
    if (effectiveQuery.length < 1) return []
    return findMatchingDroids(effectiveQuery, gameData.droids, 6)
  }, [effectiveQuery])

  const selectedDroid = useMemo(() => {
    if (effectiveQuery.length < 1) return null
    return pickBestDroidMatch(effectiveQuery, gameData.droids)
  }, [effectiveQuery])

  const needs = useMemo(() => {
    if (!selectedDroid) return []
    return collectDroidProgressNeeds(selectedDroid.id)
  }, [selectedDroid])

  const grouped = useMemo(
    () => (needs.length ? groupNeedsByPath(needs, progress) : []),
    [needs, progress],
  )

  useEffect(() => {
    setExpandedPaths((prev) => {
      const next = { ...prev }
      let changed = false
      for (const { pathId } of grouped) {
        if (next[pathId] === undefined) {
          next[pathId] = pathId === progress.pathId
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [grouped, progress.pathId])

  const nextHit = useMemo(
    () => (needs.length ? nextUpcomingNeedRebirth(needs, progress) : null),
    [needs, progress],
  )

  const neverNeeded = selectedDroid ? isDroidNeverNeededForProgress(selectedDroid.id) : false

  const cycleLabel = (pathId: string) =>
    cycleDisplayNameForId(pathId, cycleById.get(pathId)?.name ?? pathId, i18n.language)

  return (
    <div className="dc-screen-stack-item" data-testid="progress-droid-search">
      <label className="sr-only" htmlFor="progress-droid-search-input">
        {t('progress.search.label')}
      </label>
      <div className="dc-search-wrap">
        <SearchInput
          id="progress-droid-search-input"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('progress.search.placeholder')}
          aria-controls="progress-droid-search-results"
          aria-expanded={effectiveQuery.length > 0}
          data-testid="progress-droid-search-input"
          clearLabel={t('progress.search.clear')}
          clearTestId="progress-droid-search-clear"
          onClear={() => setQuery('')}
        />
      </div>

      <div id="progress-droid-search-results" className="space-y-3">
        {effectiveQuery.length > 0 && !selectedDroid ? (
          <p className="text-sm text-ui-muted" data-testid="progress-droid-search-empty">
            {t('progress.search.noMatch')}
          </p>
        ) : null}

        {selectedDroid && neverNeeded ? <NeverNeededCard droid={selectedDroid} /> : null}

        {selectedDroid && !neverNeeded ? (
          <div className="flex items-center gap-3">
            <DroidImage droid={selectedDroid} size="sm" />
            <div className="min-w-0">
              <p className="font-medium truncate">{selectedDroid.name}</p>
              <p className="text-xs text-ui-muted">{t('progress.search.needsSummary')}</p>
            </div>
          </div>
        ) : null}

        {matchedDroids.length > 1 && effectiveQuery.length > 0 ? (
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
                    ? 'border-[var(--ui-accent-fill)]/50 bg-ui-hover-strong text-ui-fg'
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
          <CycleNeedGroup
            key={pathId}
            pathId={pathId}
            hits={hits}
            cycleLabel={cycleLabel(pathId)}
            isCurrent={pathId === progress.pathId}
            expanded={expandedPaths[pathId] ?? pathId === progress.pathId}
            onToggleExpanded={() =>
              setExpandedPaths((p) => ({ ...p, [pathId]: !p[pathId] }))
            }
            nextHit={nextHit}
            tierLabels={tierLabels}
            onNavigateToStep={onNavigateToStep}
          />
        ))}
      </div>
    </div>
  )
}

function NeverNeededCard({ droid }: { droid: NonNullable<ReturnType<typeof droidById.get>> }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-3 items-start" data-testid="progress-droid-search-never">
      <DroidImage droid={droid} size="sm" />
      <div className="space-y-1 text-sm">
        <p className="font-medium">{t('progress.search.neverNeeded', { name: droid.name })}</p>
        <p className="text-ui-muted text-xs">{t('progress.search.canSell')}</p>
      </div>
    </div>
  )
}

function CycleNeedGroup({
  pathId,
  hits,
  cycleLabel,
  isCurrent,
  expanded,
  onToggleExpanded,
  nextHit,
  tierLabels,
  onNavigateToStep,
}: {
  pathId: string
  hits: ProgressDroidNeedHit[]
  cycleLabel: string
  isCurrent: boolean
  expanded: boolean
  onToggleExpanded: () => void
  nextHit: ProgressDroidNeedHit | null
  tierLabels: Map<string, string>
  onNavigateToStep: (target: ProgressNavTarget) => void
}) {
  const { t } = useTranslation()
  const rebirthCount = new Set(hits.map((h) => h.rebirth)).size
  const ciclo = cycleNumberFromPathId(pathId)

  if (!isCurrent && !expanded) {
    return (
      <section data-testid={`progress-search-path-${pathId}`}>
        <button
          type="button"
          data-testid={`progress-search-path-summary-${pathId}`}
          onClick={onToggleExpanded}
          aria-expanded={false}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-ui bg-ui-hover/40 px-3 py-2.5 text-sm text-ui-secondary hover:bg-ui-hover-strong transition-colors"
        >
          <span>{t('progress.search.cycleSummary', { ciclo, count: rebirthCount, defaultValue: '' })}</span>
          <CaretRight {...uiIconProps} className="size-4 shrink-0 opacity-60" />
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-2" data-testid={`progress-search-path-${pathId}`}>
      <div className="flex items-center gap-2">
        {!isCurrent ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded
            className="text-xs font-semibold uppercase tracking-wide text-ui-muted hover:text-ui-fg text-left flex-1"
          >
            {t('progress.search.cycleSummary', { ciclo, count: rebirthCount })}
          </button>
        ) : (
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ui-muted flex-1">
            {cycleLabel}
            <span className="ml-2 normal-case font-medium text-ui-accent">
              {t('progress.search.currentCycle')}
            </span>
          </h3>
        )}
      </div>
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
  const showDone = status === 'done'

  const tierLabel = formatTierName(hit.tier, tierLabels)
  const fusionResult =
    hit.kind === 'fusion' && hit.fusionResultDroidId
      ? droidById.get(hit.fusionResultDroidId)?.name
      : null

  const ciclo = cycleNumberFromPathId(hit.pathId)
  const openLabel = t('progress.search.openStepAria', { ciclo, n: hit.rebirth })

  return (
    <li>
      <button
        type="button"
        onClick={onGo}
        aria-label={openLabel}
        data-testid={`progress-search-hit-${hit.pathId}-${hit.rebirth}`}
        className={cn(
          'w-full text-left rounded-xl border border-ui bg-ui-hover/50 px-3 py-2.5 text-sm hover:bg-ui-hover-strong transition-colors flex items-center gap-2',
          highlight && 'ring-2 ring-[var(--ui-accent-fill)]/50 bg-[var(--ui-accent-fill)]/10',
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate whitespace-nowrap">
            {t('progress.search.rebirthStep', { n: hit.rebirth })}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ui-secondary">
            <span className="min-w-0">
              {hit.kind === 'fusion' && fusionResult
                ? t('progress.search.fusionLine', {
                    tier: tierLabel,
                    qty: hit.quantity,
                    result: fusionResult,
                  })
                : t('progress.search.requirementLine', { tier: tierLabel, qty: hit.quantity })}
              {hit.kind === 'disputed' ? ` · ${t('progress.search.disputed')}` : null}
            </span>
            {showDone ? <Badge tone="success">{t('progress.search.statusDone')}</Badge> : null}
            {highlight ? <Badge tone="warn">{t('progress.search.nextNeed')}</Badge> : null}
          </div>
        </div>
        <CaretRight {...uiIconProps} className="size-4 shrink-0 text-ui-muted" />
      </button>
    </li>
  )
}
