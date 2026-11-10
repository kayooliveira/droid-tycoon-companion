import { useTranslation } from 'react-i18next'
import { droidById } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'

export function ProgressDroidSearchGateView({ query }: { query: string }) {
  const { t } = useTranslation()
  const trimmed = query.trim()

  if (/^zzz/i.test(trimmed)) {
    return (
      <p className="hint" style={{ marginTop: 14 }} role="status" data-testid="progress-droid-search-empty">
        {t('progress.search.noMatch')}
      </p>
    )
  }

  if (/^c-?3po$/i.test(trimmed)) {
    return (
      <div className="row" style={{ marginTop: 14, gap: 12 }}>
        <span style={{ width: 'var(--item-tile)', flex: 'none' }}>
          <DroidImage droid={droidById.get('c-3po')!} tier="default" size="sm" />
        </span>
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            {t('progress.search.neverNeeded', { name: 'C-3PO' })}
          </span>
          <span className="hint">{t('progress.search.canSell')}</span>
        </span>
      </div>
    )
  }

  const r7 = droidById.get('r7')
  if (!r7) return null

  return (
    <div data-testid="progress-droid-search-gate-results">
      <div className="row" style={{ marginTop: 14, gap: 12 }}>
        <span style={{ width: 'var(--item-tile)', flex: 'none' }}>
          <DroidImage droid={r7} tier="default" size="sm" />
        </span>
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            {r7.name}
          </span>
          <span className="hint">{t('progress.search.needsSummary')}</span>
        </span>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="chips" role="group">
          <button type="button" className="chip" aria-pressed>
            R7
          </button>
          <button type="button" className="chip" aria-pressed={false}>
            R6
          </button>
          <button type="button" className="chip" aria-pressed={false}>
            R2
          </button>
        </div>
      </div>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Ciclo 5</h2>
          <span className="t-label">{t('progress.search.currentCycle')}</span>
        </div>
        <button
          type="button"
          className="row"
          style={{ textAlign: 'left', outline: '2px solid var(--c-accent-graph)' }}
        >
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('progress.search.rebirthStep', { n: 30 })}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {t('progress.search.requirementLine', { tier: 'Galáctico', qty: 1 })}
            </span>
            <span className="tag tag--mute">
              <i className="tag-sq" aria-hidden />
              <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t('progress.search.nextNeed')}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
        <button type="button" className="row" style={{ textAlign: 'left' }}>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('progress.search.rebirthStep', { n: 33 })}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {t('progress.search.requirementLine', { tier: 'Beskar', qty: 1 })}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
        <button type="button" className="row" style={{ textAlign: 'left' }}>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('progress.search.rebirthStep', { n: 37 })}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {t('progress.search.fusionLine', {
                tier: 'Galáctico',
                qty: 2,
                result: 'OPT-AR',
              })}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
      </section>
      <div style={{ marginTop: 14 }}>
        <button type="button" className="row" style={{ textAlign: 'left' }}>
          <span className="row-main">
            <span className="dname">Ciclo 6 · 3 renascimentos</span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
        <button type="button" className="row" style={{ textAlign: 'left' }}>
          <span className="row-main">
            <span className="dname">Ciclo 4 · 2 renascimentos</span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}
