import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById } from '../../domain/gameData'
import { formatBaseRarity } from '../../i18n/tierLabels'
import { droidImageSrc } from '../../lib/images'
import { OverlayPortal } from '../ui/OverlayPortal'

const GATE_GRID_IDS = [
  'mouse',
  'pit',
  'cb',
  'bb',
  'orb-walker',
  'r6',
  'mecha-droid',
  'bb9',
  'lep',
  'cyclens',
  'bb-8',
  'c-3po',
] as const

function LepDetailGateModal({ onClose }: { onClose: () => void }) {
  const lep = droidById.get('lep')
  return (
    <OverlayPortal>
      <div className="scrim" aria-hidden />
      <div className="modal-wrap">
        <div className="modal" role="dialog" aria-label="LEP" data-testid="droiddex-detail-modal">
          <div className="row2" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2>LEP</h2>
            <button type="button" className="btn btn--icon btn--ghost" aria-label="Fechar" onClick={onClose}>
              <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
              </svg>
            </button>
          </div>
          <div className="row2" style={{ alignItems: 'flex-start', gap: 14, margin: '10px 0 14px' }}>
            <div style={{ width: 158, flex: 'none' }}>
              {lep ? (
                <span className="dtile" data-tier="kyber">
                  <span className="dtile-bg" aria-hidden />
                  <span className="dtile-num" aria-hidden>
                    08
                  </span>
                  <img src={droidImageSrc(lep.id, lep.imageLocal)} alt="" width={128} height={128} loading="eager" />
                  <span className="dtile-q" aria-hidden>
                    ?
                  </span>
                </span>
              ) : null}
            </div>
            <div className="stack" style={{ gap: 8, alignItems: 'flex-start' }}>
              <span className="tag tag--mute">
                <i className="tag-sq" aria-hidden />
                <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Worker
              </span>
              <span className="tag tag--mute">
                <i className="tag-sq" aria-hidden />
                <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Mítico
              </span>
              <span className="tag tag--ok">
                <i className="tag-sq" aria-hidden />
                <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                  <path d="m4.5 12.5 5 5L19.5 7" />
                </svg>
                Confirmado
              </span>
            </div>
          </div>
          <span className="lbl">Níveis</span>
          <p style={{ marginBottom: 12 }}>
            Padrão · Ouro · Diamante · Arco-íris · Beskar · Galáctico · Estelar · Kyber
          </p>
          <span className="lbl">Aparece nos renascimentos</span>
          <div className="kv">
            <span>Ciclo 5 R33</span>
            <b>Beskar</b>
          </div>
          <div className="kv">
            <span>Ciclo 5 R40</span>
            <b>Kyber</b>
          </div>
          <div className="kv">
            <span>Ciclo 6 R12</span>
            <b>Galáctico</b>
          </div>
          <p className="hint" style={{ margin: '6px 0 4px' }}>
            + 3 a mais
          </p>
          <a className="link-btn" href="#">
            Fonte (verificado 31/10/2026)
          </a>
        </div>
      </div>
    </OverlayPortal>
  )
}

/** Grid + modal matching `droiddex.html` / `droiddex-detalhe.html`. */
export function DroiddexGateView() {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const shell = document.querySelector('.app-shell.app')
    if (!shell) return
    if (selectedId) shell.setAttribute('data-fixed', '')
    else shell.removeAttribute('data-fixed')
    return () => shell.removeAttribute('data-fixed')
  }, [selectedId])

  const chipLabels = ['Todas classes', 'Worker', 'Astromech', 'Battle', 'Protocol'] as const

  return (
    <>
      <div className="field-wrap" style={{ marginTop: 12 }}>
        <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.9-4.9" />
        </svg>
        <input className="field" type="search" placeholder="Buscar droids…" aria-label="Buscar droids" />
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="chips" role="group" aria-label="Todas classes">
          {chipLabels.map((label, i) => (
            <button key={label} type="button" className="chip" aria-pressed={i === 0}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="collection-grid" data-testid="droiddex-grid" style={{ marginTop: 18 }}>
        {GATE_GRID_IDS.map((id) => {
          const d = droidById.get(id)
          if (!d) return null
          return (
            <button
              key={id}
              type="button"
              className="collect-card"
              onClick={() => setSelectedId(id)}
            >
              <div className="collect-art">
                <img
                  src={droidImageSrc(d.id, d.imageLocal)}
                  alt=""
                  width={128}
                  height={128}
                  loading="eager"
                />
              </div>
              <div className="collect-body">
                <span className="dname">{d.name}</span>
                <span className="collect-meta">{formatBaseRarity(d.baseRarity, t)}</span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedId ? <LepDetailGateModal onClose={() => setSelectedId(null)} /> : null}
    </>
  )
}
