import { ArrowRight } from '@phosphor-icons/react'
import { uiIconProps } from '../components/ui/iconStyle'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PathProgressSwitcher } from '../components/PathProgressSwitcher'
import { RequirementCard } from '../components/RequirementCard'
import { ShareExportCard } from '../components/ShareExportCard'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { cn } from '../lib/utils'
import { ProgressBar } from '../components/ui/ProgressBar'
import { getRebirth } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH } from '../domain/progress'
import { evaluateRequirements, metRequirementCount } from '../domain/requirements'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { isDataStale } from '../domain/gameData'
import { useAppStore } from '../store/useAppStore'

const DASHBOARD_SEEN_KEY = 'dt-helper-dashboard-seen'

export function DashboardPage() {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const next = getRebirth(progress.pathId, progress.nextRebirth)
  const checks = next ? evaluateRequirements(next.requirements, inventory, trackInventory) : []
  const sell = summarizeSellCenter(
    analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory),
  )
  const ready = metRequirementCount(checks)
  const missing = next ? 3 - ready : 0

  const showIntroRef = useRef(typeof localStorage !== 'undefined' && localStorage.getItem(DASHBOARD_SEEN_KEY) !== '1')
  useEffect(() => {
    localStorage.setItem(DASHBOARD_SEEN_KEY, '1')
  }, [])

  let nextStepKey = 'dashboard.nextStepProgress'
  let nextStepHref = '/progress'
  if (next && trackInventory && missing > 0) {
    nextStepKey = 'dashboard.nextStepInventory'
    nextStepHref = '/inventory'
  } else if (trackInventory && sell.sellable > 0) {
    nextStepKey = 'dashboard.nextStepSell'
    nextStepHref = '/sell'
  } else if (next) {
    nextStepKey = 'dashboard.nextStepComplete'
    nextStepHref = '/progress'
  }

  const nextStepText =
    nextStepKey === 'dashboard.nextStepInventory'
      ? t('dashboard.nextStepInventory', { count: missing })
      : nextStepKey === 'dashboard.nextStepSell'
        ? t('dashboard.nextStepSell', { count: sell.sellable })
        : t(nextStepKey)

  return (
    <div className="space-y-4 pb-28 md:pb-8" data-testid="dashboard-ready">
      {showIntroRef.current ? (
        <GlassCard className="space-y-3 border-holo-500/20 bg-holo-600/5">
          <p className="text-sm text-zinc-400 text-pretty leading-snug">{t('dashboard.hero')}</p>
          <Link
            to="/progress"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium min-h-11',
              'bg-holo-600 hover:bg-holo-500 text-white shadow-lg shadow-holo-900/30 border border-holo-400/20',
            )}
          >
            {t('dashboard.ctaProgress')}
            <ArrowRight {...uiIconProps} />
          </Link>
        </GlassCard>
      ) : (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3" data-testid="next-step">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{t('dashboard.nextStepLabel')}</p>
            <p className="text-sm font-medium mt-0.5 text-pretty">{nextStepText}</p>
          </div>
          <Link
            to={nextStepHref}
            data-testid="dashboard-next-step-cta"
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold min-h-11 shrink-0',
              'bg-holo-600 hover:bg-holo-500 text-white border border-holo-400/25 shadow-md shadow-holo-900/20',
            )}
          >
            {t('dashboard.nextStepGo')}
            <ArrowRight {...uiIconProps} />
          </Link>
        </GlassCard>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <PathProgressSwitcher />
        {isDataStale() ? <Badge tone="warn">{t('dashboard.staleData')}</Badge> : null}
      </div>

      <GlassCard className="space-y-2 p-3">
        <ProgressBar label={t('progress.pathProgress')} value={pathProgressPercent(progress)} />
        {trackInventory ? (
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            <div>
              <p className="text-[10px] text-zinc-500 leading-tight">{t('dashboard.statsRequired')}</p>
              <p className="text-lg font-semibold tabular-nums">3</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 leading-tight">{t('dashboard.statsReady')}</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-300">{ready}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 leading-tight">{t('dashboard.statsKeep')}</p>
              <p className="text-lg font-semibold tabular-nums">{sell.keep}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 leading-tight">{t('dashboard.statsSellable')}</p>
              <p className="text-lg font-semibold tabular-nums text-holo-300">{sell.sellable}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">
            {t('progress.completedCount', {
              done: progress.completedOnPath,
              total: REBIRTHS_PER_PATH,
            })}
          </p>
        )}
      </GlassCard>

      <GlassCard className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-display text-base tracking-wide text-gradient-holo">
            {t('dashboard.nextSection')} #{Math.min(progress.nextRebirth, REBIRTHS_PER_PATH)}
          </h2>
          {next ? (
            <Badge tone={next.confidence === 'confirmed' ? 'success' : 'warn'}>
              {t(`confidence.${next.confidence}`)}
            </Badge>
          ) : null}
        </div>
        {next ? (
          <>
            <p className="text-xs text-zinc-500">
              {t('dashboard.credits', { credits: next.credits })}
              {next.unlocks ? ` · ${t('dashboard.unlocks', { item: next.unlocks })}` : ''}
            </p>
            <div className="space-y-2">
              {checks.map((c) => (
                <RequirementCard key={c.requirement.droidId} check={c} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-400">{t('progress.pathComplete')}</p>
        )}
      </GlassCard>

      <ShareExportCard />
    </div>
  )
}
