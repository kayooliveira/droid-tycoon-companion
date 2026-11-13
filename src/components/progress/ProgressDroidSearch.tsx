import { CaretRight } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useSoftKeyboardVisible } from '../../hooks/useSoftKeyboardVisible'
import { useTierLabels } from '../../i18n/useTierLabels'
import { cycleDisplayNameForId } from '../../lib/cycleLabel'
import { findMatchingDroids } from '../../lib/droidNameMatch'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { DroidImage } from '../DroidImage'
import { SearchInput } from '../ui/SearchInput'
import { uiIconProps } from '../ui/iconStyle'
import {
  formatTierListPt,
  nextUsePreviewLine,
  pickDroidById,
  tierThumbForDroid,
  uniqueTiersInHits,
} from './progressSearchHelpers'

export type ProgressNavTarget = { pathId: string; rebirth: number }

type ProgressDroidSearchProps = {
  initialQuery?: string
  onNavigateToStep: (target: ProgressNavTarget) => void
  onSearchActiveChange?: (active: boolean) => void
  stickySearch?: boolean
}

export function ProgressDroidSearch({
  initialQuery = '',
  onNavigateToStep,
  onSearchActiveChange,
  stickySearch = false,
}: ProgressDroidSearchProps) {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const [query, setQuery] = useState(initialQuery)
  const [selectedDroidId, setSelectedDroidId] = useState<string | null>(null)
  const [browseQuery, setBrowseQuery] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({})
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmedQuery = query.trim()
  const searchActive = trimmedQuery.length > 0

  useEffect(() => {
    onSearchActiveChange?.(searchActive)
  }, [searchActive, onSearchActiveChange])

  const keyboardOpen = useSoftKeyboardVisible(inputFocused && searchActive)

  useEffect(() => {
    const root = document.documentElement
    if (keyboardOpen) root.dataset.ddKeyboard = 'open'
    else delete root.dataset.ddKeyboard
    return () => {
      delete root.dataset.ddKeyboard
    }
  }, [keyboardOpen])

  const matchedDroids = useMemo(() => {
    if (trimmedQuery.length < 1) return []
    return findMatchingDroids(trimmedQuery, gameData.droids, 12)
  }, [trimmedQuery])

  const selectedDroid = useMemo(
    () => pickDroidById(gameData.droids, selectedDroidId),
    [selectedDroidId],
  )

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

  const clearAll = () => {
    setQuery('')
    setSelectedDroidId(null)
    setBrowseQuery('')
  }

  const selectDroid = (droidId: string, name: string) => {
    setBrowseQuery(trimmedQuery)
    setSelectedDroidId(droidId)
    setQuery(name)
  }

  const backToMatches = () => {
    setSelectedDroidId(null)
    setQuery(browseQuery || trimmedQuery)
  }

  const showTypingList =
    searchActive && !selectedDroid && matchedDroids.length > 0 && trimmedQuery.length > 0
  const showNoMatch = searchActive && !selectedDroid && matchedDroids.length === 0
  const showSelected = searchActive && selectedDroid != null
  const showEmptyHint = !searchActive

  const cycleCount = grouped.length
  const selectedSummary =
    selectedDroid && nextHit && !neverNeeded
      ? t('progress.search.appearsSummary', {
          cycleCount,
          ciclo: cycleNumberFromPathId(progress.pathId),
          n: nextHit.rebirth,
          tier: formatTierName(nextHit.tier, tierLabels),
          qty: nextHit.quantity,
        })
      : null

  return (
    <div
      className={cn('progress-droid-search', stickySearch && 'busca-stick')}
      data-testid="progress-droid-search"
      data-keyboard-open={keyboardOpen ? 'true' : undefined}
    >
      <label className="sr-only" htmlFor="progress-droid-search-input">
        {t('progress.search.label')}
      </label>
      <SearchInput
        id="progress-droid-search-input"
        ref={inputRef}
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelectedDroidId(null)
        }}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        placeholder={t('progress.search.placeholder')}
        aria-controls="progress-droid-search-results"
        aria-expanded={searchActive}
        data-testid="progress-droid-search-input"
        clearLabel={t('progress.search.clear')}
        clearTestId="progress-droid-search-clear"
        onClear={clearAll}
        className="progress-search-field"
        inputClassName={inputFocused ? 'is-focus' : undefined}
      />

      {showEmptyHint ? (
        <p className="hint busca-hint" data-testid="progress-droid-search-hint">
          {t('progress.search.emptyHint')}
        </p>
      ) : null}

      <div id="progress-droid-search-results" className="busca-results">
        {showNoMatch ? (
          <p className="text-sm busca-status" data-testid="progress-droid-search-empty">
            {t('progress.search.noMatch')}
            <span className="block hint" style={{ marginTop: 6 }}>
              {t('progress.search.noMatchHint')}
            </span>
          </p>
        ) : null}

        {showTypingList ? (
          <>
            <p className="t-meta" style={{ margin: '4px 0 0' }}>
              {t('progress.search.matchCount', { count: matchedDroids.length })}
            </p>
            <div className="busca-list" role="listbox" aria-label={t('progress.search.pickDroid')}>
              {matchedDroids.map((d) => {
                const tier = tierThumbForDroid(d.id, progress)
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="option"
                    className="busca-hit"
                    data-testid={`progress-search-pick-${d.id}`}
                    onClick={() => selectDroid(d.id, d.name)}
                  >
                    <span className="busca-thumb" aria-hidden>
                      <DroidImage droid={d} tier={tier} size="sm" />
                    </span>
                    <span className="row-main">
                      <span className="dname">{d.name}</span>
                      <span className="hint" style={{ display: 'block' }}>
                        {nextUsePreviewLine(d.id, progress, tierLabels, t)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : null}

        {showSelected && selectedDroid ? (
          <SelectedDroidPanel
            droid={selectedDroid}
            browseQuery={browseQuery}
            neverNeeded={neverNeeded}
            summary={selectedSummary}
            grouped={grouped}
            nextHit={nextHit}
            expandedPaths={expandedPaths}
            onBack={backToMatches}
            onTogglePath={(pathId) =>
              setExpandedPaths((p) => ({ ...p, [pathId]: !p[pathId] }))
            }
            cycleLabel={cycleLabel}
            tierLabels={tierLabels}
            onNavigateToStep={onNavigateToStep}
          />
        ) : null}
      </div>
    </div>
  )
}

function TierPill({ tier, label }: { tier: string; label: string }) {
  return (
    <span className="tier-pill">
      <i className="tier-swatch" data-tier={tier} aria-hidden />
      {label}
    </span>
  )
}

function SelectedDroidPanel({
  droid,
  browseQuery,
  neverNeeded,
  summary,
  grouped,
  nextHit,
  expandedPaths,
  onBack,
  onTogglePath,
  cycleLabel,
  tierLabels,
  onNavigateToStep,
}: {
  droid: NonNullable<ReturnType<typeof droidById.get>>
  browseQuery: string
  neverNeeded: boolean
  summary: string | null
  grouped: Array<{ pathId: string; hits: ProgressDroidNeedHit[] }>
  nextHit: ProgressDroidNeedHit | null
  expandedPaths: Record<string, boolean>
  onBack: () => void
  onTogglePath: (pathId: string) => void
  cycleLabel: (pathId: string) => string
  tierLabels: Map<string, string>
  onNavigateToStep: (target: ProgressNavTarget) => void
}) {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)

  const thumbTier = nextHit?.tier ?? tierThumbForDroid(droid.id, progress)

  const currentPathId = progress.pathId
  const currentGroup = grouped.find((g) => g.pathId === currentPathId)
  const otherGroups = grouped.filter((g) => g.pathId !== currentPathId)

  const stillInCurrent =
    currentGroup?.hits.filter(
      (h) =>
        !(
          nextHit &&
          h.pathId === nextHit.pathId &&
          h.rebirth === nextHit.rebirth &&
          h.tier === nextHit.tier &&
          h.kind === nextHit.kind
        ),
    ) ?? []

  if (neverNeeded) {
    return (
      <div className="busca-status" data-testid="progress-droid-search-never">
        <div className="busca-head">
          <span className="busca-thumb busca-thumb--head" aria-hidden>
            <DroidImage droid={droid} size="sm" />
          </span>
          <span className="row-main">
            <span className="dname">{droid.name}</span>
            <span className="hint" style={{ display: 'block' }}>
              {t('progress.search.needsSummary')}
            </span>
          </span>
        </div>
        <p className="text-sm" style={{ marginTop: 8 }}>
          {t('progress.search.neverNeeded', { name: droid.name })}
        </p>
        <p className="hint text-xs">{t('progress.search.canSell')}</p>
      </div>
    )
  }

  return (
    <>
      {browseQuery ? (
        <button type="button" className="busca-back" onClick={onBack}>
          {t('progress.search.backToResults', { query: browseQuery })}
        </button>
      ) : null}

      <div className="busca-head">
        <span className="busca-thumb busca-thumb--head" aria-hidden>
          <DroidImage droid={droid} tier={thumbTier} size="sm" />
        </span>
        <span className="row-main">
          <span className="dname">{droid.name}</span>
          <span className="hint" style={{ display: 'block' }}>
            {t('progress.search.needsSummary')}
          </span>
        </span>
      </div>

      {summary ? <p className="hint busca-sum">{summary}</p> : null}

      {nextHit && nextHit.pathId === currentPathId ? (
        <>
          <NextUseCard hit={nextHit} tierLabels={tierLabels} onGo={() => onNavigateToStep({ pathId: nextHit.pathId, rebirth: nextHit.rebirth })} />
          <div className="need-cta">
            <button
              type="button"
              className="btn btn--primary btn--block"
              data-testid="progress-search-next-cta"
              onClick={() => onNavigateToStep({ pathId: nextHit.pathId, rebirth: nextHit.rebirth })}
            >
              {t('progress.search.viewRebirth', { n: nextHit.rebirth })}
            </button>
          </div>
        </>
      ) : nextHit ? (
        <>
          <NextUseCard hit={nextHit} tierLabels={tierLabels} onGo={() => onNavigateToStep({ pathId: nextHit.pathId, rebirth: nextHit.rebirth })} />
          <div className="need-cta">
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => onNavigateToStep({ pathId: nextHit.pathId, rebirth: nextHit.rebirth })}
            >
              {t('progress.search.viewRebirth', { n: nextHit.rebirth })}
            </button>
          </div>
        </>
      ) : null}

      {stillInCurrent.length > 0 ? (
        <section className="busca-sec" data-testid={`progress-search-path-${currentPathId}`}>
          <div className="sec-h">
            <h2 className="t-h2">{t('progress.search.stillInCycle', { ciclo: cycleNumberFromPathId(currentPathId) })}</h2>
            <span className="t-label">{t('progress.search.currentCycle')}</span>
          </div>
          <ul className="busca-sec-list">
            {stillInCurrent.map((hit) => (
              <CompactNeedRow key={rowKey(hit)} hit={hit} tierLabels={tierLabels} onGo={() => onNavigateToStep({ pathId: hit.pathId, rebirth: hit.rebirth })} />
            ))}
          </ul>
        </section>
      ) : null}

      {otherGroups.length > 0 ? (
        <section className="busca-sec">
          <div className="sec-h">
            <h2 className="t-h2">{t('progress.search.otherCycles')}</h2>
          </div>
          {otherGroups.map(({ pathId, hits }) => (
            <OtherCycleGroup
              key={pathId}
              pathId={pathId}
              hits={hits}
              expanded={expandedPaths[pathId] ?? false}
              onToggle={() => onTogglePath(pathId)}
              cycleLabel={cycleLabel(pathId)}
              tierLabels={tierLabels}
              onNavigateToStep={onNavigateToStep}
            />
          ))}
        </section>
      ) : null}
    </>
  )
}

function rowKey(hit: ProgressDroidNeedHit) {
  return `${hit.pathId}-${hit.rebirth}-${hit.tier}-${hit.kind}-${hit.fusionId ?? ''}`
}

function NextUseCard({
  hit,
  tierLabels,
  onGo,
}: {
  hit: ProgressDroidNeedHit
  tierLabels: Map<string, string>
  onGo: () => void
}) {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const tierLabel = formatTierName(hit.tier, tierLabels)
  const ciclo = cycleNumberFromPathId(hit.pathId)
  const onCurrent = hit.pathId === progress.pathId
  const status = rebirthNeedStatus(hit.pathId, hit.rebirth, progress)
  const foot =
    onCurrent && status === 'upcoming'
      ? t('progress.search.nextCardFootCurrent', { ciclo })
      : t('progress.search.nextCardFootOther', { ciclo })

  return (
    <button
      type="button"
      className="need-next"
      data-testid="progress-search-next-card"
      data-highlighted={onCurrent ? 'true' : undefined}
      aria-label={t('progress.search.openStepAria', { ciclo, n: hit.rebirth })}
      onClick={onGo}
    >
      <span className="t-label need-kicker">{t('progress.search.nextInYourCycle')}</span>
      <span className="dname">{t('progress.search.rebirthStep', { n: hit.rebirth })}</span>
      <span className="need-line">
        <TierPill tier={hit.tier} label={tierLabel} />
        <span className="need-qty">×{hit.quantity}</span>
      </span>
      <span className="hint" style={{ display: 'block', marginTop: 8 }}>
        {foot}
      </span>
    </button>
  )
}

function CompactNeedRow({
  hit,
  tierLabels,
  onGo,
}: {
  hit: ProgressDroidNeedHit
  tierLabels: Map<string, string>
  onGo: () => void
}) {
  const { t } = useTranslation()
  const tierLabel = formatTierName(hit.tier, tierLabels)
  const ciclo = cycleNumberFromPathId(hit.pathId)

  return (
    <li>
      <button
        type="button"
        className="need-row"
        data-testid={`progress-search-hit-${hit.pathId}-${hit.rebirth}`}
        aria-label={t('progress.search.openStepAria', { ciclo, n: hit.rebirth })}
        onClick={onGo}
      >
        <span className="row-main">
          <span className="dname">{t('progress.search.rebirthStep', { n: hit.rebirth })}</span>
          <span className="need-line">
            <TierPill tier={hit.tier} label={tierLabel} />
            <span className="need-qty">×{hit.quantity}</span>
          </span>
        </span>
        <span className="chev" aria-hidden>
          <CaretRight {...uiIconProps} className="ic" width={20} height={20} />
        </span>
      </button>
    </li>
  )
}

function OtherCycleGroup({
  pathId,
  hits,
  expanded,
  onToggle,
  cycleLabel,
  tierLabels,
  onNavigateToStep,
}: {
  pathId: string
  hits: ProgressDroidNeedHit[]
  expanded: boolean
  onToggle: () => void
  cycleLabel: string
  tierLabels: Map<string, string>
  onNavigateToStep: (target: ProgressNavTarget) => void
}) {
  const { t } = useTranslation()
  const rebirthCount = new Set(hits.map((h) => h.rebirth)).size
  const tiers = formatTierListPt(uniqueTiersInHits(hits, tierLabels))

  if (!expanded) {
    return (
      <button
        type="button"
        className="cycle-fold"
        data-testid={`progress-search-path-summary-${pathId}`}
        aria-expanded={false}
        onClick={onToggle}
      >
        <span className="row-main">
          <span className="dname">{cycleLabel}</span>
          <span className="hint">
            {t('progress.search.cycleFoldHint', { count: rebirthCount, tiers })}
          </span>
        </span>
        <span className="chev" aria-hidden>
          <CaretRight {...uiIconProps} className="ic" width={20} height={20} />
        </span>
      </button>
    )
  }

  return (
    <section data-testid={`progress-search-path-${pathId}`} className="busca-sec-nested">
      <button
        type="button"
        className="cycle-fold"
        aria-expanded
        onClick={onToggle}
      >
        <span className="row-main">
          <span className="dname">{cycleLabel}</span>
          <span className="hint">
            {t('progress.search.cycleFoldHint', { count: rebirthCount, tiers })}
          </span>
        </span>
        <span className="chev" aria-hidden>
          <CaretRight {...uiIconProps} className="ic" width={20} height={20} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>
      <ul className="busca-sec-list">
        {hits.map((hit) => (
          <CompactNeedRow
            key={rowKey(hit)}
            hit={hit}
            tierLabels={tierLabels}
            onGo={() => onNavigateToStep({ pathId: hit.pathId, rebirth: hit.rebirth })}
          />
        ))}
      </ul>
    </section>
  )
}
