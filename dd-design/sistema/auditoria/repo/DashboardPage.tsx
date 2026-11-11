<cursor_untrusted_data_1337 source="CallDynamicTool">

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CycleProgressStrip } from '../components/home/CycleProgressStrip'
import { DroidImage } from '../components/DroidImage'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { InsetGroup } from '../components/ui/InsetGroup'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { evaluateRequirements } from '../domain/requirements'
import { useAppStore } from '../store/useAppStore'

export function DashboardPage() {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const cycle = gameData.cycles.find((c) => c.id === progress.pathId)
  const next = getRebirth(progress.pathId, progress.nextRebirth)
  const checks = next ? evaluateRequirements(next.requirements, inventory, trackInventory) : []
  const sell = summarizeSellCenter(analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory))

  return (
    <TabScrollLayout title={t('nav.dashboard')} testId="home-hub">
      <CycleProgressStrip />
      <h2 className="dc-section-header">{t('home.nextRenascimentoSection')}</h2>
      {next ? (
        <div className="rebirth-hero">
          <p className="rebirth-kicker">
            {t('progress.listRebirthHeading', { n: next.rebirth })} · {next.credits}
          </p>
          <div className="hero-droid-row">
            {checks.map((c) => {
              const d = droidById.get(c.requirement.droidId)
              if (!d) return null
              const ok = c.status === 'ready'
              return (
                <div key={c.requirement.droidId} className="hero-droid">
                  <DroidImage droid={d} tier={c.requirement.rarity} size="sm" className="!h-auto !w-full aspect-square max-h-[112px] rounded-[14px]" />
                  <span className="dc-droid-name">{d.name}</span>
                  <span className="hero-tier">{formatTierName(c.requirement.rarity, tierLabels)}</span>
                  <span className={`status-mark ${ok ? 'status-ok' : 'status-miss'}`}>
                    {ok ? t('status.ready') : t('status.missing')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
      {next ? (
        <InsetGroup footer={t('home.creditsDisclaimer')}>
          <div className="dc-row">
            <div className="dc-row-main">
              <span className="dc-row-label">{t('pdf.credits')}</span>
              <span className="dc-row-sub">{next.credits}</span>
            </div>
          </div>
        </InsetGroup>
      ) : null}
      <h2 className="dc-section-header">{t('pdf.sellNow')}</h2>
      <InsetGroup>
        <Link to="/sell" className="dc-row dc-row-chevron">
          <div className="dc-row-main">
            <span className="dc-row-label">
              {sell.sellable > 0
                ? t('home.sellCount', { n: sell.sellable })
                : t('home.sellEmpty')}
            </span>
            <span className="dc-row-sub">{cycle ? t('home.sellInCycle') : ''}</span>
          </div>
        </Link>
      </InsetGroup>
      <Link to="/progress" className="btn-filled btn-wide">
        {t('home.primaryViewProgress')}
      </Link>
      <h2 className="dc-section-header">{t('home.cycleSummaryTitle')}</h2>
      <InsetGroup>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('pdf.rebirthsDone')}</span>
            <span className="dc-row-sub">{progress.completedOnPath}</span>
          </div>
        </div>
        <Link to="/progress" className="dc-row dc-row-chevron">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('progress.superRebirth')}</span>
            <span className="dc-row-sub">{t('home.superPending')}</span>
          </div>
        </Link>
        <Link to="/inventory" className="dc-row dc-row-chevron">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('pdf.inventory')}</span>
            <span className="dc-row-sub">{inventory.length}</span>
          </div>
        </Link>
      </InsetGroup>
      <div className="dc-scroll-spacer" aria-hidden />
    </TabScrollLayout>
  )
}


</cursor_untrusted_data_1337>