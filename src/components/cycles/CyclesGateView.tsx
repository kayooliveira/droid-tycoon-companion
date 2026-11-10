import { droidById, getRebirth } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'
import { ChipRadioGroup } from '../ui/ChipRadioGroup'

const GATE_PATH = 'path-5'

function Accordion({
  n,
  credits,
  conf,
  open,
  reqs,
  note,
}: {
  n: number
  credits: string
  conf: string
  open: boolean
  reqs?: Array<{ id: string; tier: 'default'; qty: number }>
  note?: string
}) {
  const entry = getRebirth(GATE_PATH, n)
  const creditLabel = entry?.credits ?? credits
  return (
    <div className="acc" data-testid={`cycles-rebirth-group-${n}`}>
      <button
        type="button"
        className="acc-h"
        aria-expanded={open}
        data-testid={`cycles-rebirth-${n}`}
      >
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            Renascimento #{n}
          </span>
          <span className="hint" style={{ display: 'block' }}>
            {creditLabel} · {conf}
          </span>
        </span>
        <span className="chev" aria-hidden>
          <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
            <path d={open ? 'm5 9 7 7 7-7' : 'm9 5 7 7-7 7'} />
          </svg>
        </span>
      </button>
      {open && reqs ? (
        <div className="acc-body">
          {note ? (
            <p className="note-warn" style={{ padding: '4px 0 8px' }}>
              {note}
            </p>
          ) : null}
          {reqs.map((r) => {
            const d = droidById.get(r.id)
            if (!d) return null
            return (
              <div key={r.id} className="item">
                <button type="button" className="item-open" aria-label={d.name}>
                  <DroidImage droid={d} tier={r.tier} size="sm" quantity={r.qty > 1 ? r.qty : undefined} />
                  <span className="item-body">
                    <span className="dname">{d.name}</span>
                    <span className="t-meta">
                      Padrão{r.qty > 1 ? ` · ×${r.qty}` : ''}
                    </span>
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/** Static `ciclos.html` layout for design gate captures. */
export function CyclesGateView() {
  const cycleOptions = Array.from({ length: 6 }, (_, i) => ({
    value: `path-${i + 1}`,
    label: `Ciclo ${i + 1}`,
  }))

  return (
    <>
      <p className="hint" style={{ marginTop: 6 }}>
        Guia de referência dos dados da comunidade. Não usa seu progresso salvo.
      </p>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Escolha o Ciclo</h2>
        </div>
        <ChipRadioGroup
          ariaLabel="Escolha o Ciclo"
          testId="cycles-path-chips"
          grid
          value={GATE_PATH}
          onChange={() => {}}
          options={cycleOptions}
        />
        <div style={{ marginTop: 14 }}>
          <button type="button" className="btn btn--secondary" data-testid="cycles-pdf-export">
            <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
              <path d="M6 4h9l5 5v11H6z" />
            </svg>
            Exportar PDF do Ciclo
          </button>
          <p className="hint" style={{ marginTop: 8 }}>
            Guia imprimível de Ciclo 5 com cada renascimento. Sem progresso pessoal.
          </p>
        </div>
      </section>

      <Accordion
        n={1}
        credits="10K"
        conf="Confirmado"
        open
        note="Alguns guias divergem neste passo."
        reqs={[
          { id: 'mouse', tier: 'default', qty: 2 },
          { id: 'cb', tier: 'default', qty: 1 },
          { id: 'bb', tier: 'default', qty: 1 },
        ]}
      />
      <Accordion n={2} credits="25K" conf="Confirmado" open={false} />
      <Accordion n={3} credits="50K" conf="Parcial" open={false} />
      <Accordion n={4} credits="80K" conf="Confirmado" open={false} />

      <p className="hint" style={{ margin: '10px 0 0' }}>
        Mais 36 renascimentos abaixo, na mesma lista.
      </p>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Super Renascimento</h2>
        </div>
        <p style={{ marginBottom: 8 }}>
          Libera depois do renascimento #40. Reseta créditos e melhorias da base; quase todos os droids
          somem, exceto os Icônicos.
        </p>
        <span className="hint">Não confirmado</span>
      </section>
    </>
  )
}
