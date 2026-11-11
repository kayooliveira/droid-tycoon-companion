import { droidById } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'
import { DesignSystemTag } from '../ui/DesignSystemTag'

/** Full-page middle for `progresso-disputa.html` (Ciclo 2 @ #17). */
export function ProgressDisputeGateView() {
  const r7 = droidById.get('r7')
  const lo = droidById.get('lo')
  const r6 = droidById.get('r6')

  return (
  <div className="progress-dispute-gate">
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Requisitos disputados</h2>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="hint" style={{ display: 'block' }}>
              Renascimento #17: R7 (Diamante) ou B2-RP (Diamante), conforme o guia.
            </span>
          </span>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="t-meta" style={{ display: 'block' }}>
              Principal (R7 Diamante)
            </span>
            <span className="dname">R7 Diamante</span>
          </span>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="t-meta" style={{ display: 'block' }}>
              Alternativa (B2-RP Diamante)
            </span>
            <span className="dname">B2-RP Diamante</span>
          </span>
        </div>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Renascimento #17</h2>
          <span className="t-label">Créditos 40T</span>
        </div>
        {[
          { droid: r7, tier: 'diamond' as const, owned: 1, showControls: true },
          { droid: lo, tier: 'galactic' as const, owned: 1, showControls: true },
          { droid: r6, tier: 'galactic' as const, owned: 0, showControls: true },
        ].map(({ droid, tier, owned, showControls }) =>
          droid ? (
            <div key={droid.id} className="item">
              <button type="button" className="item-open" aria-label={`Abrir ${droid.name}`}>
                <DroidImage droid={droid} tier={tier} size="sm" />
                <span className="item-body">
                  <span className="dname">{droid.name}</span>
                  <span className="t-meta">
                    {tier === 'diamond' ? 'Diamante' : 'Galáctico'} · {owned}/1
                  </span>
                  <DesignSystemTag kind="bad">Não venda</DesignSystemTag>
                </span>
              </button>
              {showControls ? (
                <>
                  <button type="button" className="btn btn--icon btn--secondary" aria-label={`Tirar ${droid.name}`}>
                    <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="btn btn--icon btn--primary"
                    aria-label={`Adicionar ${droid.name}`}
                  >
                    <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </>
              ) : null}
            </div>
          ) : null,
        )}
      </section>

      <div className="stack" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn--primary">
          Concluir
        </button>
        <button type="button" className="btn btn--secondary" data-testid="progress-force-complete-inline">
          Concluir mesmo assim
        </button>
        <button type="button" className="btn btn--ghost" data-testid="progress-undo-inline">
          Desfazer
        </button>
      </div>
    </div>
  )
}
