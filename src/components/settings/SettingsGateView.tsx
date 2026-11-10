import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="row-ic" aria-hidden>
      {children}
    </span>
  )
}

function SwitchRow({ label, on }: { label: string; on: boolean }) {
  return (
    <label className="switch-row">
      <span>
        <span style={{ display: 'block' }}>{label}</span>
      </span>
      <span className="switch">
        <input type="checkbox" role="switch" defaultChecked={on} readOnly />
        <i />
      </span>
    </label>
  )
}

/** `ajustes.html` / `ajustes-dados-velhos.html` (capture-only). */
export function SettingsGateView({ stale }: { stale: boolean }) {
  const gameDataSub = stale ? 'v1.36 · 1.2.0 · Velho' : 'v1.36 · 1.2.0 · Dados recentes'

  return (
    <>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Aparência</h2>
        </div>
        <Link to="/settings/appearance" className="row">
          <RowIcon>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
              <circle cx="15" cy="7" r="2" />
              <circle cx="9" cy="17" r="2" />
            </svg>
          </RowIcon>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Visual e modo
            </span>
            <span className="hint" style={{ display: 'block' }}>
              Oficina · segue o sistema
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
        <SwitchRow label="Animações" on />
        <SwitchRow label="Registrar inventário" on />
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Idioma</h2>
        </div>
        <div className="seg" role="group" aria-label="Idioma">
          <button type="button" aria-pressed>
            Português
          </button>
          <button type="button" aria-pressed={false}>
            English
          </button>
        </div>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Progresso</h2>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="t-label" style={{ display: 'block' }}>
              Ciclo
            </span>
          </span>
          <button type="button" className="sel" aria-label="Trocar ciclo: Ciclo 5">
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
              <path d="M20 12a8 8 0 1 1-2.6-5.9" />
              <path d="M20.5 3.5v4.5H16" />
            </svg>
            Ciclo 5
            <svg className="ic" width={18} height={18} viewBox="0 0 24 24" aria-hidden>
              <path d="m5 9 7 7 7-7" />
            </svg>
          </button>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Progresso do ciclo
            </span>
            <span className="hint" style={{ display: 'block' }}>
              Concluídos: 29 · Próximo renascimento: #30
            </span>
          </span>
        </div>
        <div className="row" style={{ display: 'block', minHeight: 0 }}>
          <div className="lbl-row">
            <span className="lbl">Renascimentos concluídos (29)</span>
            <span className="val">29</span>
          </div>
          <input
            className="range"
            type="range"
            min={0}
            max={40}
            defaultValue={29}
            style={{ ['--p' as string]: '72.5%' }}
            aria-label="Renascimentos concluídos"
            readOnly
          />
          <div className="range-scale">
            <span>0</span>
            <span>40</span>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Dados</h2>
        </div>
        <div className="row">
          <RowIcon>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6M12 8h.01" />
            </svg>
          </RowIcon>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Dados do jogo
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {gameDataSub}
            </span>
          </span>
        </div>
        <button type="button" className="row">
          <RowIcon>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
              <path d="M5 12v8.5h14V12" />
            </svg>
          </RowIcon>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Exportar
            </span>
            <span className="hint" style={{ display: 'block' }}>
              Salva o progresso em um arquivo JSON
            </span>
          </span>
        </button>
        <button type="button" className="row" data-testid="settings-import-trigger">
          <RowIcon>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M12 15.5V4M7.5 8 12 3.5 16.5 8" />
              <path d="M5 19.5h14" />
            </svg>
          </RowIcon>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Importar
            </span>
            <span className="hint" style={{ display: 'block' }}>
              Escolha um arquivo JSON
            </span>
          </span>
        </button>
        <p className="hint" style={{ marginTop: 8 }}>
          Atualize com scripts/parse.py e troque src/data/gameData.json.
        </p>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Compartilhar</h2>
        </div>
        <button type="button" className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Compartilhar app
            </span>
          </span>
        </button>
        <button type="button" className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              WhatsApp
            </span>
          </span>
        </button>
        <button type="button" className="row" data-testid="share-progress-card">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Card de progresso
            </span>
          </span>
        </button>
        <p className="hint" style={{ marginTop: 8 }}>
          Nada é enviado ao servidor.
        </p>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Sobre</h2>
        </div>
        <button type="button" className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Refazer setup
            </span>
          </span>
        </button>
        <Link to="/about" className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Sobre
            </span>
          </span>
        </Link>
        <button type="button" className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Mandar feedback / Entrar no grupo
            </span>
          </span>
        </button>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Zona de risco</h2>
        </div>
        <button type="button" className="btn btn--danger" data-testid="settings-reset-trigger">
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M4 7h16" />
            <path d="M9.5 7V4h5v3" />
            <path d="M6 7l1 13.5h10L18 7" />
          </svg>
          Apagar tudo
        </button>
      </section>
    </>
  )
}
