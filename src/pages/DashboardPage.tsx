import {
  Export,
  Flask,
  Sparkle,
  Storefront,
  TreeStructure,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CycleTimeline } from '../components/home/CycleTimeline'
import { PathProgressSwitcher } from '../components/PathProgressSwitcher'
import { ShareExportCard } from '../components/ShareExportCard'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { uiIconProps } from '../components/ui/iconStyle'
import { gameDataSource } from '../data/dataSource'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { unitsSellableAfterRebirth } from '../domain/rebirthSellPlan'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { canCompleteRebirth } from '../domain/progress'
import { evaluateRequirements } from '../domain/requirements'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { useAppStore } from '../store/useAppStore'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const meta = gameDataSource.getMeta()
  const cycle = gameData.cycles.find((c) => c.id === progress.pathId)

  const next = getRebirth(progress.pathId, progress.nextRebirth)
  const checks = next ? evaluateRequirements(next.requirements, inventory, trackInventory) : []
  const canComplete = next
    ? canCompleteRebirth(progress.pathId, next.rebirth, inventory, trackInventory)
    : false
  const sellAnalysis = analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory)
  const sell = summarizeSellCenter(sellAnalysis)
  const completedRebirth = Math.max(0, progress.nextRebirth - 1)
  const sellSamples = unitsSellableAfterRebirth(progress.pathId, completedRebirth)
    .filter((u) => u.disposition === 'sellable')
    .slice(0, 3)

  return (
    <div className="space-y-4 md:pb-8" data-testid="home-hub">
      <GlassCard className="space-y-3 p-4" data-testid="home-now">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ui-soft">{t('home.nowTitle')}</p>
            <p className="font-display text-lg font-semibold mt-0.5">
              {cycle ? formatCycleDisplayName(cycle.name, i18n.language) : progress.pathId}
            </p>
            <p className="text-sm text-ui-muted">
              {t('home.nextRenascimento', { n: progress.nextRebirth })}
            </p>
          </div>
          <PathProgressSwitcher compact />
        </div>
        {next ? (
          <ul className="space-y-2">
            {checks.map((c) => {
              const d = droidById.get(c.requirement.droidId)
              if (!d) return null
              const ok = c.status === 'ready'
              return (
                <li key={c.requirement.droidId} className="flex items-center gap-2 text-sm">
                  <DroidImage droid={d} size="sm" />
                  <span className="flex-1 truncate">{d.name}</span>
                  <Badge tone={ok ? 'success' : 'danger'}>{t(`status.${c.status}`)}</Badge>
                </li>
              )
            })}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {canComplete || !trackInventory ? (
            <Link to="/progress">
              <Button icon={<TreeStructure {...uiIconProps} />}>
                {t('home.primaryComplete')}
              </Button>
            </Link>
          ) : (
            <Link to="/progress">
              <Button variant="secondary" icon={<TreeStructure {...uiIconProps} />}>
                {t('home.primaryViewProgress')}
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-4 space-y-2" data-testid="home-sell">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{t('home.sellTitle')}</h2>
          <Badge tone="info">{sell.sellable}</Badge>
        </div>
        {sell.sellable > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {sellSamples.map((row) => {
              const d = droidById.get(row.droidId)
              const tier = formatTierName(row.tier, tierLabels)
              return (
                <span
                  key={row.droidId}
                  className="inline-flex items-center gap-1 rounded-full bg-ui-hover border border-ui px-2 py-1 text-[11px]"
                >
                  {d ? <DroidImage droid={d} size="sm" className="!h-6 !w-6" /> : null}
                  {d?.name ?? row.droidId}
                  <span className="text-ui-soft">· {tier}</span>
                </span>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-ui-soft">{t('home.sellEmpty')}</p>
        )}
        <Link to="/sell" className="inline-block pt-1">
          <Button size="sm" variant="secondary" icon={<Storefront {...uiIconProps} />}>
            {t('home.sellLink')}
          </Button>
        </Link>
      </GlassCard>

      <GlassCard className="p-4">
        <CycleTimeline completed={progress.completedOnPath} />
      </GlassCard>

      <GlassCard className="p-4 space-y-2" data-testid="home-news">
        <h2 className="text-sm font-semibold">{t('home.newsTitle')}</h2>
        <p className="text-xs text-ui-muted">
          {t('home.newsGameLine', { game: meta.gameVersion, date: meta.lastUpdated })}
        </p>
        <Link to="/about#app-changelog" className="text-xs text-ui-accent hover:underline">
          {t('home.newsChangelog')}
        </Link>
      </GlassCard>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold px-0.5">{t('home.toolsTitle')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { to: '/fusion', label: t('home.toolFusion'), icon: Flask },
            { to: '/droiddex', label: t('home.toolDroiddex'), icon: Sparkle },
            { to: '#home-export', label: t('home.toolExport'), icon: Export },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="surface-card p-3 flex flex-col items-center gap-2 text-center min-h-[5.5rem] justify-center hover:bg-ui-hover transition-colors"
            >
              <Icon {...uiIconProps} className="text-ui-accent" />
              <span className="text-[11px] font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
        <div id="home-export">
          <ShareExportCard />
        </div>
      </div>
    </div>
  )
}
