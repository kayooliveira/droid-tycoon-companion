import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useSoftKeyboardVisible } from '../../hooks/useSoftKeyboardVisible'
import { useTierLabels } from '../../i18n/useTierLabels'
import { cycleDisplayNameForId } from '../../lib/cycleLabel'
import { findMatchingDroids } from '../../lib/droidNameMatch'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { DroidImage } from '../DroidImage'
import { SearchInput } from '../ui/SearchInput'
import {
  CycleSummaryCard,
  NeedRowCompact,
  SearchHitCard,
} from './progressSearchUi'
import {
  nextUseForDroid,
  pickDroidById,
  sortMatchedDroids,
  tierThumbForDroid,
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
  const [suppressTabRestore, setSuppressTabRestore] = useState(false)
  const suppressTabTimerRef = useRef<number | null>(null)

  const trimmedQuery = query.trim()
  const searchActive = trimmedQuery.length > 0

  useEffect(() => {
    onSearchActiveChange?.(searchActive)
  }, [searchActive, onSearchActiveChange])

  useSoftKeyboardVisible(inputFocused)

  const hideTabBar = inputFocused || suppressTabRestore

  useEffect(() => {
    const root = document.documentElement
    if (hideTabBar) root.dataset.ddKeyboard = 'open'
    else delete root.dataset.ddKeyboard
    return () => {
      delete root.dataset.ddKeyboard
    }
  }, [hideTabBar])

  const holdTabBarDuringTap = useCallback(() => {
    setSuppressTabRestore(true)
    if (suppressTabTimerRef.current != null) {
      window.clearTimeout(suppressTabTimerRef.current)
    }
    suppressTabTimerRef.current = window.setTimeout(() => {
      setSuppressTabRestore(false)
      suppressTabTimerRef.current = null
    }, 400)
  }, [])

  const dismissSearch = useCallback(() => {
    setQuery('')
    setSelectedDroidId(null)
    setBrowseQuery('')
    setInputFocused(false)
    document.getElementById('progress-droid-search-input')?.blur()
  }, [])

  const handleNavigate = useCallback(
    (target: ProgressNavTarget) => {
      holdTabBarDuringTap()
      dismissSearch()
      onNavigateToStep(target)
    },
    [dismissSearch, holdTabBarDuringTap, onNavigateToStep],
  )

  const handleBlur = useCallback(() => {
    window.setTimeout(() => {
      if (suppressTabRestore) return
      setInputFocused(false)
    }, 150)
  }, [suppressTabRestore])

  const matchedDroids = useMemo(() => {
    if (trimmedQuery.length < 1) return []
    const found = findMatchingDroids(trimmedQuery, gameData.droids, 12)
    return sortMatchedDroids(found, progress)
  }, [trimmedQuery, progress])

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
          next[pathId] = false
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [grouped])

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

  return (
    <div
      className="progress-droid-search"
      data-testid="progress-droid-search"
      data-keyboard-open={hideTabBar ? 'true' : undefined}
    >
      <div className={cn(stickySearch && 'busca-stick', 'busca-field-block')}>
        <label className="sr-only" htmlFor="progress-droid-search-input">
          {t('progress.search.label')}
        </label>
        <SearchInput
          id="progress-droid-search-input"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedDroidId(null)
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={handleBlur}
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
      </div>

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
            <p className="t-meta busca-count">
              {t('progress.search.matchCount', { count: matchedDroids.length })}
            </p>
            <div className="hit-list" role="listbox" aria-label={t('progress.search.pickDroid')}>
              {matchedDroids.map((d) => {
                const hit = nextUseForDroid(d.id, progress)
                const highlighted =
                  hit != null &&
                  hit.pathId === progress.pathId &&
                  hit.rebirth === progress.nextRebirth
                return (
                  <SearchHitCard
                    key={d.id}
                    droid={d}
                    hit={hit}
                    tierLabels={tierLabels}
                    highlighted={highlighted}
                    onPick={() => selectDroid(d.id, d.name)}
                    onHoldPointerDown={holdTabBarDuringTap}
                  />
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
            grouped={grouped}
            nextHit={nextHit}
            expandedPaths={expandedPaths}
            onBack={backToMatches}
            onTogglePath={(pathId) =>
              setExpandedPaths((p) => ({ ...p, [pathId]: !p[pathId] }))
            }
            cycleLabel={cycleLabel}
            tierLabels={tierLabels}
            onNavigateToStep={handleNavigate}
            onHoldPointerDown={holdTabBarDuringTap}
          />
        ) : null}
      </div>
    </div>
  )
}

function hitEquals(a: ProgressDroidNeedHit, b: ProgressDroidNeedHit) {
  return (
    a.pathId === b.pathId &&
    a.rebirth === b.rebirth &&
    a.tier === b.tier &&
    a.kind === b.kind &&
    a.fusionId === b.fusionId
  )
}

function SelectedDroidPanel({
  droid,
  browseQuery,
  neverNeeded,
  grouped,
  nextHit,
  expandedPaths,
  onBack,
  onTogglePath,
  cycleLabel,
  tierLabels,
  onNavigateToStep,
  onHoldPointerDown,
}: {
  droid: NonNullable<ReturnType<typeof droidById.get>>
  browseQuery: string
  neverNeeded: boolean
  grouped: Array<{ pathId: string; hits: ProgressDroidNeedHit[] }>
  nextHit: ProgressDroidNeedHit | null
  expandedPaths: Record<string, boolean>
  onBack: () => void
  onTogglePath: (pathId: string) => void
  cycleLabel: (pathId: string) => string
  tierLabels: Map<string, string>
  onNavigateToStep: (target: ProgressNavTarget) => void
  onHoldPointerDown: () => void
}) {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)

  const thumbTier = nextHit?.tier ?? tierThumbForDroid(droid.id, progress)
  const currentPathId = progress.pathId
  const currentGroup = grouped.find((g) => g.pathId === currentPathId)
  const otherGroups = grouped.filter((g) => g.pathId !== currentPathId)
  const currentHits = currentGroup?.hits ?? []

  const passedHits = currentHits.filter(
    (h) => rebirthNeedStatus(h.pathId, h.rebirth, progress) === 'done',
  )
  const stillHits = currentHits.filter((h) => {
    if (nextHit && hitEquals(h, nextHit)) return false
    return rebirthNeedStatus(h.pathId, h.rebirth, progress) === 'upcoming'
  })

  if (neverNeeded) {
    return (
      <div className="busca-status" data-testid="progress-droid-search-never">
        {browseQuery ? (
          <button type="button" className="busca-back" onClick={onBack}>
            {t('progress.search.backToResults', { query: browseQuery })}
          </button>
        ) : null}
        <div className="busca-head">
          <span className="busca-thumb" aria-hidden>
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

  const featuredOnCurrent = nextHit?.pathId === currentPathId
  const sectionTitle = featuredOnCurrent
    ? t('progress.search.inYourCycle')
    : t('progress.search.nextUpcoming')

  return (
    <>
      {browseQuery ? (
        <button type="button" className="busca-back" onClick={onBack}>
          {t('progress.search.backToResults', { query: browseQuery })}
        </button>
      ) : null}

      <div className="busca-head">
        <span className="busca-thumb" aria-hidden>
          <DroidImage droid={droid} tier={thumbTier} size="sm" />
        </span>
        <span className="row-main">
          <span className="dname">{droid.name}</span>
          <span className="hint" style={{ display: 'block' }}>
            {t('progress.search.needsSummary')}
          </span>
        </span>
      </div>

      {nextHit ? (
        <section className="busca-sec" data-testid={`progress-search-path-${currentPathId}`}>
          <div className="sec-h">
            <h2 className="t-h2">{sectionTitle}</h2>
            {featuredOnCurrent ? (
              <span className="t-label">
                {t('progress.search.cycleLabelShort', {
                  ciclo: cycleNumberFromPathId(currentPathId),
                })}
              </span>
            ) : (
              <span className="t-label">
                {t('progress.search.cycleLabelShort', {
                  ciclo: cycleNumberFromPathId(nextHit.pathId),
                })}
              </span>
            )}
          </div>
          <NeedRowCompact
            hit={nextHit}
            tierLabels={tierLabels}
            featured
            showBadge
            onHoldPointerDown={onHoldPointerDown}
            onGo={() => onNavigateToStep({ pathId: nextHit.pathId, rebirth: nextHit.rebirth })}
            testId="progress-search-next-card"
          />
          <div className="need-cta">
            <button
              type="button"
              className="btn btn--primary btn--block"
              data-testid="progress-search-next-cta"
              onPointerDown={onHoldPointerDown}
              onClick={() =>
                onNavigateToStep({ pathId: nextHit.pathId, rebirth: nextHit.rebirth })
              }
            >
              {t('progress.search.viewRebirth', { n: nextHit.rebirth })}
            </button>
          </div>
        </section>
      ) : null}

      {passedHits.length > 0 ? (
        <section className="busca-sec">
          <div className="sec-h">
            <h2 className="t-h2">
              {t('progress.search.alreadyPassedInCycle', {
                ciclo: cycleNumberFromPathId(currentPathId),
              })}
            </h2>
          </div>
          {passedHits.map((hit) => (
            <NeedRowCompact
              key={`${hit.pathId}-${hit.rebirth}-${hit.tier}`}
              hit={hit}
              tierLabels={tierLabels}
              showBadge
              onHoldPointerDown={onHoldPointerDown}
              onGo={() => onNavigateToStep({ pathId: hit.pathId, rebirth: hit.rebirth })}
            />
          ))}
        </section>
      ) : null}

      {stillHits.length > 0 ? (
        <section className="busca-sec">
          <div className="sec-h">
            <h2 className="t-h2">
              {t('progress.search.stillInCycle', { ciclo: cycleNumberFromPathId(currentPathId) })}
            </h2>
          </div>
          {stillHits.map((hit) => (
            <NeedRowCompact
              key={`${hit.pathId}-${hit.rebirth}-${hit.tier}`}
              hit={hit}
              tierLabels={tierLabels}
              onHoldPointerDown={onHoldPointerDown}
              onGo={() => onNavigateToStep({ pathId: hit.pathId, rebirth: hit.rebirth })}
            />
          ))}
        </section>
      ) : null}

      {otherGroups.length > 0 ? (
        <section className="busca-sec">
          <div className="sec-h">
            <h2 className="t-h2">{t('progress.search.otherCycles')}</h2>
          </div>
          {otherGroups.map(({ pathId, hits }) => (
            <OtherCycleBlock
              key={pathId}
              pathId={pathId}
              hits={hits}
              expanded={expandedPaths[pathId] ?? false}
              onToggle={() => onTogglePath(pathId)}
              cycleLabel={cycleLabel(pathId)}
              tierLabels={tierLabels}
              onNavigateToStep={onNavigateToStep}
              onHoldPointerDown={onHoldPointerDown}
            />
          ))}
        </section>
      ) : null}
    </>
  )
}

function OtherCycleBlock({
  pathId,
  hits,
  expanded,
  onToggle,
  cycleLabel,
  tierLabels,
  onNavigateToStep,
  onHoldPointerDown,
}: {
  pathId: string
  hits: ProgressDroidNeedHit[]
  expanded: boolean
  onToggle: () => void
  cycleLabel: string
  tierLabels: Map<string, string>
  onNavigateToStep: (target: ProgressNavTarget) => void
  onHoldPointerDown: () => void
}) {
  return (
    <section data-testid={`progress-search-path-${pathId}`} className="busca-sec-nested">
      <CycleSummaryCard
        pathId={pathId}
        hits={hits}
        cycleLabel={cycleLabel}
        expanded={expanded}
        onToggle={onToggle}
      />
      {expanded
        ? hits.map((hit) => (
            <NeedRowCompact
              key={`${hit.pathId}-${hit.rebirth}-${hit.tier}`}
              hit={hit}
              tierLabels={tierLabels}
              onHoldPointerDown={onHoldPointerDown}
              onGo={() => onNavigateToStep({ pathId: hit.pathId, rebirth: hit.rebirth })}
            />
          ))
        : null}
    </section>
  )
}
