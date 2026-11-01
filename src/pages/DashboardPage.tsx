import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { RequirementCard } from '../components/RequirementCard'
import { ShareMenu } from '../components/ShareMenu'
import { DownloadCycleMenu } from '../components/DownloadCycleMenu'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { cn } from '../lib/utils'
import { ProgressBar } from '../components/ui/ProgressBar'
import { gameData, getRebirth } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH } from '../domain/progress'
import { evaluateRequirements, metRequirementCount } from '../domain/requirements'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { isDataStale } from '../domain/gameData'
import { useAppStore } from '../store/useAppStore'

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

  return (
    <div className="space-y-6" data-testid="dashboard-ready">
      <GlassCard className="space-y-3 border-holo-500/20 bg-holo-600/5">
        <p className="text-sm text-zinc-400 text-pretty leading-snug">{t('dashboard.hero')}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/progress"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium min-h-11',
              'bg-holo-600 hover:bg-holo-500 text-white shadow-lg shadow-holo-900/30 border border-holo-400/20',
            )}
          >
            {t('dashboard.ctaProgress')}
            <ArrowRight size={16} />
          </Link>
          {!trackInventory ? (
            <Link
              to="/settings"
              className="inline-flex items-center justify-center min-h-11 rounded-xl px-4 py-2.5 text-sm border border-white/15 text-zinc-200 hover:bg-white/10"
            >
              {t('dashboard.ctaInventory')}
            </Link>
          ) : null}
        </div>
      </GlassCard>

      <div data-testid="next-step">
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">{t('dashboard.nextStepLabel')}</p>
            <p className="text-sm font-medium mt-1">
              {nextStepKey === 'dashboard.nextStepInventory'
                ? t('dashboard.nextStepInventory', { count: missing })
                : nextStepKey === 'dashboard.nextStepSell'
                  ? t('dashboard.nextStepSell', { count: sell.sellable })
                  : t(nextStepKey)}
            </p>
          </div>
          <Link
            to={nextStepHref}
            className="inline-flex items-center gap-1 text-sm text-holo-300 hover:text-holo-200 min-h-11 px-3"
          >
            {t('dashboard.nextStepGo')}
            <ArrowRight size={16} />
          </Link>
        </GlassCard>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PathProgressSwitcher />
          </div>
          <ProgressSummaryLine />
        </div>
        {isDataStale() ? (
          <Badge tone="warn">{t('dashboard.staleData')}</Badge>
        ) : (
          <Badge tone="info">{t('dashboard.dataVersion', { version: gameData.dataVersion })}</Badge>
        )}
      </div>

      <GlassCard>
        <ProgressBar label={t('progress.pathProgress')} value={pathProgressPercent(progress)} />
        <p className="text-xs text-zinc-500 mt-2">
          {t('progress.completedCount', {
            done: progress.completedOnPath,
            total: REBIRTHS_PER_PATH,
          })}
        </p>
      </GlassCard>

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-display text-lg tracking-wide text-gradient-holo">
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
            <p className="text-sm text-zinc-400">
              {t('dashboard.credits', { credits: next.credits })}
              {next.unlocks ? ` · ${t('dashboard.unlocks', { item: next.unlocks })}` : ''}
            </p>
            {next.note ? (
              <p className="text-xs text-amber-200/90 border border-amber-400/20 rounded-lg p-2">
                {next.note}
              </p>
            ) : null}
            <div className="space-y-2">
              {checks.map((c) => (
                <RequirementCard key={c.requirement.droidId} check={c} />
              ))}
            </div>
            {trackInventory ? (
              <ProgressBar
                label={t('dashboard.rebirthReadyCount', {
                  ready: metRequirementCount(checks),
                  total: 3,
                })}
                value={(metRequirementCount(checks) / 3) * 100}
              />
            ) : null}
          </>
        ) : (
          <p className="text-sm text-zinc-400">{t('progress.pathComplete')}</p>
        )}
      </GlassCard>

      {trackInventory ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard>
            <p className="text-xs text-zinc-500">{t('dashboard.statsRequired')}</p>
            <p className="text-2xl font-semibold">3</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-zinc-500">{t('dashboard.statsReady')}</p>
            <p className="text-2xl font-semibold text-emerald-300">{metRequirementCount(checks)}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-zinc-500">{t('dashboard.statsKeep')}</p>
            <p className="text-2xl font-semibold">{sell.keep}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-zinc-500">{t('dashboard.statsSellable')}</p>
            <p className="text-2xl font-semibold text-holo-300">{sell.sellable}</p>
          </GlassCard>
        </div>
      ) : null}

      <DownloadCycleMenu />
      <ShareMenu />
    </div>
  )
}
