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
      <h2 className="sec-h">{t('home.nextRenascimentoSection')}</h2>
      {next ? (
        <div className="hero">
          <p className="hr-kicker">
            {t('progress.listRebirthHeading', { n: next.rebirth })} · {next.credits}
          </p>
          <div className="trio">
            {checks.map((c) => {
              const d = droidById.get(c.requirement.droidId)
              if (!d) return null
              const ok = c.status === 'ready'
              return (
                <div key={c.requirement.droidId} className="req-col">
                  <DroidImage droid={d} tier={c.requirement.rarity} size="sm" className="!h-auto !w-full aspect-square max-h-[112px] rounded-[14px]" />
                  <span className="dname">{d.name}</span>
                  <span className="t-meta">{formatTierName(c.requirement.rarity, tierLabels)}</span>
                  <span className={`status-mark ${ok ? 'tag tag--ok' : 'tag tag--bad'}`}>
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
          <div className="row">
            <div className="row-main">
              <span className="row-title">{t('pdf.credits')}</span>
              <span className="hint">{next.credits}</span>
            </div>
          </div>
        </InsetGroup>
      ) : null}
      <h2 className="sec-h">{t('pdf.sellNow')}</h2>
      <InsetGroup>
        <Link to="/sell" className="row row row--link">
          <div className="row-main">
            <span className="row-title">
              {sell.sellable > 0
                ? t('home.sellCount', { n: sell.sellable })
                : t('home.sellEmpty')}
            </span>
            <span className="hint">{cycle ? t('home.sellInCycle') : ''}</span>
          </div>
        </Link>
      </InsetGroup>
      <Link to="/progress" className="btn btn--primary">
        {t('home.primaryViewProgress')}
      </Link>
      <h2 className="sec-h">{t('home.cycleSummaryTitle')}</h2>
      <InsetGroup>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('pdf.rebirthsDone')}</span>
            <span className="hint">{progress.completedOnPath}</span>
          </div>
        </div>
        <Link to="/progress" className="row row row--link">
          <div className="row-main">
            <span className="row-title">{t('progress.superRebirth')}</span>
            <span className="hint">{t('home.superPending')}</span>
          </div>
        </Link>
        <Link to="/inventory" className="row row row--link">
          <div className="row-main">
            <span className="row-title">{t('pdf.inventory')}</span>
            <span className="hint">{inventory.length}</span>
          </div>
        </Link>
      </InsetGroup>
      <div aria-hidden />
    </TabScrollLayout>
  )
}
