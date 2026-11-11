import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CycleProgressStrip } from '../components/home/CycleProgressStrip'
import { DroidImage } from '../components/DroidImage'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { evaluateRequirements } from '../domain/requirements'
import { useAppStore } from '../store/useAppStore'
import { formatCycleDisplayName } from '../lib/cycleLabel'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const cycle = gameData.cycles.find((c) => c.id === progress.pathId)
  const next = getRebirth(progress.pathId, progress.nextRebirth)
  const checks = next ? evaluateRequirements(next.requirements, inventory, trackInventory) : []
  const sell = summarizeSellCenter(analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory))
  const cycleLabel = cycle ? formatCycleDisplayName(cycle.name, i18n.language) : progress.pathId

  return (
    <TabScrollLayout
      title={t('nav.dashboard')}
      testId="home-hub"
      className="dashboard-compact"
      headerExtra={<span className="chip-static">{cycleLabel}</span>}
    >
      <CycleProgressStrip variant="home" />
      {next ? (
        <section className="hero">
          <div className="hr-head">
            <h2 className="hr-kicker">{t('home.nextRenascimentoSection')}</h2>
            <span className="hr-num" aria-label={t('progress.listRebirthHeading', { n: next.rebirth })}>
              {next.rebirth}
            </span>
          </div>
          <div className="trio">
            {checks.map((c) => {
              const d = droidById.get(c.requirement.droidId)
              if (!d) return null
              const ok = c.status === 'ready'
              return (
                <button
                  key={c.requirement.droidId}
                  type="button"
                  className="req-col"
                  aria-label={`${d.name} ${formatTierName(c.requirement.rarity, tierLabels)}`}
                >
                  <DroidImage
                    droid={d}
                    tier={c.requirement.rarity}
                    size="md"
                    quantity={c.neededCount > 1 ? c.ownedCount : undefined}
                  />
                  <span className="dname">{d.name}</span>
                  <span className="t-meta">{formatTierName(c.requirement.rarity, tierLabels)}</span>
                  <span className={ok ? 'tag tag--ok' : 'tag tag--bad'}>
                    <i className="tag-sq" aria-hidden />
                    {ok ? (
                      <>
                        <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                          <path d="m4.5 12.5 5 5L19.5 7" />
                        </svg>
                        {t('status.ready')}
                      </>
                    ) : (
                      <>
                        <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                          <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
                        </svg>
                        {t('status.missing')}
                      </>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {next ? (
        <div className="row" style={{ marginTop: 8 }}>
          <span className="row-main">
            <span className="t-label" style={{ display: 'block' }}>
              {t('pdf.credits')}
            </span>
            <span className="dname" style={{ display: 'block' }}>
              {next.credits}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {t('home.creditsDisclaimer')}
            </span>
          </span>
        </div>
      ) : null}

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('home.sellTitle')}</h2>
        </div>
        <Link to="/sell" className="row">
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z" />
              <circle cx="8" cy="8.5" r="1.2" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {sell.sellable > 0
                ? t('home.sellCount', { n: sell.sellable })
                : t('home.sellEmpty')}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {cycle ? t('home.sellInCycle') : ''}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      <div style={{ marginTop: 12 }}>
        <Link to="/progress" className="btn btn--primary">
          {t('home.primaryViewProgress')}
        </Link>
      </div>

      <section className="sec" style={{ marginTop: 8 }}>
        <div className="sec-h">
          <h2 className="t-h2">{t('home.cycleSummaryTitle')}</h2>
        </div>
        <Link to="/progress" className="row">
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M6 21V3.5" />
              <path d="M6 4.5h12l-2.5 4 2.5 4H6" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('pdf.rebirthsDone')}
            </span>
          </span>
          <span className="row-val">{progress.completedOnPath}</span>
        </Link>
        <Link to="/progress" className="row">
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname">{t('progress.superRebirth')}</span>
            <span className="hint">{t('home.superPending')}</span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
        <Link to="/inventory" className="row">
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
              <path d="M3.5 7.5 12 12l8.5-4.5" />
              <path d="M12 12v9" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('pdf.inventory')}
            </span>
          </span>
          <span className="row-val">{inventory.length}</span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>
    </TabScrollLayout>
  )
}
