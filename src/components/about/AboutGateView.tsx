/** Static layout for `sobre.html` (capture-only). */
export function AboutGateView() {
  return (
    <>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">App de fã</h2>
        </div>
        <p>
          App de fã do Star Wars Droid Tycoon. Os números vêm de guias da comunidade, não da Epic nem
          da FOAD.
        </p>
        <p className="hint" style={{ marginTop: 10 }}>
          Ferramenta de fã. Sem vínculo com Epic Games, Lucasfilm, Disney ou FOAD.
        </p>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Fontes e atualização</h2>
        </div>
        <p className="dname">Pacote 1.36 · jogo 1.2.0 · dados de 31/10/2026</p>
        <p className="hint" style={{ margin: '4px 0 10px' }}>
          Dados recentes
        </p>
        <p className="hint">Renascimentos disputados aparecem com aviso quando os guias não batem.</p>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Dado errado ou sugestão?</h2>
        </div>
        <p style={{ marginBottom: 12 }}>Conta o que você viu no jogo versus o que o app mostra.</p>
        <button type="button" className="btn btn--secondary">
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M4 5h16v10H7l-3 3z" />
          </svg>
          Mandar feedback / Entrar no grupo
        </button>
      </section>

      <div style={{ marginTop: 16 }}>
        <a className="row" href="#" onClick={(e) => e.preventDefault()}>
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
              <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
              <circle cx="15" cy="7" r="2" />
              <circle cx="9" cy="17" r="2" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              Ajustes
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>

      <footer className="credits" style={{ marginTop: 20 }}>
        <p>Imagens: Star Wars Droid Tycoon Wiki (Fandom), licença CC BY-SA 4.0.</p>
        <p style={{ marginTop: 6 }}>Wikis e guias da comunidade (sem vínculo com sites de terceiros).</p>
        <p style={{ marginTop: 6 }}>
          Site:{' '}
          <a className="link-btn" style={{ minHeight: 44 }} href="#" onClick={(e) => e.preventDefault()}>
            dthelper.kayooliveira.com
          </a>
        </p>
      </footer>
    </>
  )
}
