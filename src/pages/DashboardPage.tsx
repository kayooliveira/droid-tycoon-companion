import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Tag, TreeStructure, Warehouse } from '@phosphor-icons/react'
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
import { uiIconProps } from '../components/ui/iconStyle'

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
      headerExtra={<span className="chip-static">{cycleLabel}</span>}
    >
      <CycleProgressStrip />
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
                    size="sm"
                    quantity={c.neededCount > 1 ? c.ownedCount : undefined}
                  />
                  <span className="dname">{d.name}</span>
                  <span className="t-meta">{formatTierName(c.requirement.rarity, tierLabels)}</span>
                  <span className={ok ? 'tag tag--ok' : 'tag tag--bad'}>
                    {ok ? t('status.ready') : t('status.missing')}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {next ? (
        <div className="row" style={{ marginTop: 12 }}>
          <span className="row-main">
            <span className="t-label">{t('pdf.credits')}</span>
            <span className="dname">{next.credits}</span>
            <span className="hint">{t('home.creditsDisclaimer')}</span>
          </span>
        </div>
      ) : null}

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('home.sellTitle')}</h2>
        </div>
        <Link to="/sell" className="row row--link">
          <span className="row-ic" aria-hidden>
            <Tag {...uiIconProps} width={24} height={24} />
          </span>
          <span className="row-main">
            <span className="dname">
              {sell.sellable > 0 ? t('home.sellCount', { n: sell.sellable }) : t('home.sellEmpty')}
            </span>
            <span className="hint">{cycle ? t('home.sellInCycle') : ''}</span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      <div style={{ marginTop: 16 }}>
        <Link to="/progress" className="btn btn--primary btn--block">
          {t('home.primaryViewProgress')}
        </Link>
      </div>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('home.cycleSummaryTitle')}</h2>
        </div>
        <div className="row">
          <span className="row-ic" aria-hidden>
            <TreeStructure {...uiIconProps} width={24} height={24} />
          </span>
          <span className="row-main">
            <span className="dname">{t('pdf.rebirthsDone')}</span>
          </span>
          <span className="row-val">{progress.completedOnPath}</span>
        </div>
        <Link to="/progress" className="row row--link">
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
        <Link to="/inventory" className="row row--link">
          <span className="row-ic" aria-hidden>
            <Warehouse {...uiIconProps} width={24} height={24} />
          </span>
          <span className="row-main">
            <span className="dname">{t('pdf.inventory')}</span>
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
