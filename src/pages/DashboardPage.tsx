import { useTranslation } from 'react-i18next'
import { gameData, getRebirth } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH } from '../domain/progress'
import { evaluateRequirements, metRequirementCount } from '../domain/requirements'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { isDataStale } from '../domain/gameData'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { RequirementCard } from '../components/RequirementCard'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { ProgressBar } from '../components/ui/ProgressBar'
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <h1 className="text-xs uppercase tracking-widest text-zinc-500 font-display">{t('dashboard.title')}</h1>
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
                label={t('dashboard.requirementsReady')}
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
    </div>
  )
}
