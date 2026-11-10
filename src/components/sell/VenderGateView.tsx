import { droidById } from '../../domain/gameData'
import { droidImageSrc } from '../../lib/images'
const TIER_NUM: Record<string, string> = {
  default: '01',
  gold: '02',
  diamond: '03',
  rainbow: '04',
  beskar: '05',
  galactic: '06',
  stellar: '07',
  kyber: '08',
  scourge: 'S',
}

function SmTile({ id, tier }: { id: string; tier: string }) {
  const d = droidById.get(id)
  if (!d) return null
  const tierNum = TIER_NUM[tier] ?? '01'
  return (
    <span className="dtile dtile--sm" data-tier={tier}>
      <span className="dtile-bg" aria-hidden />
      <span className="dtile-num" aria-hidden>
        {tierNum}
      </span>
      <img src={droidImageSrc(d.id, d.imageLocal)} alt="" width={128} height={128} loading="eager" />
      <span className="dtile-q" aria-hidden>
        ?
      </span>
    </span>
  )
}

function GateSellTag() {
  return (
    <span className="tag tag--ok">
      <i className="tag-sq" aria-hidden />
      <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
        <path d="m4.5 12.5 5 5L19.5 7" />
      </svg>
      Pode vender
    </span>
  )
}

function SellItem({
  id,
  tier,
  name,
  meta,
  note,
  sellBadge,
}: {
  id: string
  tier: string
  name: string
  meta: string
  note: string
  sellBadge?: boolean
}) {
  const tierLabel = meta.split(' · ')[0] ?? tier
  return (
    <div className="item">
      <button type="button" className="item-open" aria-label={`Abrir ${name} ${tierLabel}`}>
        <SmTile id={id} tier={tier} />
        <span className="item-body">
          <span className="dname">{name}</span>
          <span className="t-meta">{meta}</span>
          {sellBadge ? <GateSellTag /> : null}
          <span className="item-note">{note}</span>
        </span>
      </button>
    </div>
  )
}

/** `vender.html` (capture-only). */
export function VenderGateView() {
  return (
    <>
      <p className="hint" style={{ marginTop: 6 }}>
        Renascimentos 30 a 40 do Ciclo 5. Depois do Super Renascimento quase tudo reseta, então planeje o
        próximo ciclo.
      </p>
      <div style={{ marginTop: 12 }}>
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

      <section className="sec" data-testid="sell-center-safe-now">
        <div className="sec-h">
          <h2 className="t-h2">Pode vender agora</h2>
        </div>
        <SellItem
          id="kx"
          tier="beskar"
          name="KX"
          meta="Beskar · Qtd. 1"
          note="Está no seu inventário e pode vender antes do próximo renascimento."
        />
        <SellItem
          id="orb-walker"
          tier="diamond"
          name="Orb Walker"
          meta="Diamante · Qtd. 1"
          note="Está no seu inventário e pode vender antes do próximo renascimento."
        />
        <p className="hint" style={{ marginTop: 8 }}>
          Com base nos renascimentos concluídos até o #29 e no que ainda falta neste ciclo.
        </p>
      </section>

      <section className="sec" data-testid="sell-center-useNext">
        <div className="sec-h">
          <h2 className="t-h2">Usar no próximo</h2>
        </div>
        <SellItem
          id="r7"
          tier="galactic"
          name="R7"
          meta="Galáctico · Qtd. 2"
          note="Entrega no Renascimento #30 e depois pode vender."
          sellBadge
        />
      </section>

      <section className="sec" data-testid="sell-center-keep">
        <div className="sec-h">
          <h2 className="t-h2">Guardar</h2>
        </div>
        <SellItem
          id="mecha-droid"
          tier="stellar"
          name="Mecha-Droid"
          meta="Estelar · Qtd. 1"
          note="Guarde Mecha-Droid. Precisa dele no renascimento #35."
        />
        <SellItem
          id="lep"
          tier="beskar"
          name="LEP"
          meta="Beskar · Qtd. 1"
          note="Guarde LEP. Precisa de novo no renascimento #33."
        />
        <div className="item">
          <span className="item-body">
            <span className="note-warn">Guardar pra fusão</span>
          </span>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Ainda entra em renascimentos que faltam neste ciclo.
        </p>
      </section>

      <section className="sec" data-testid="sell-center-upgrade">
        <div className="sec-h">
          <h2 className="t-h2">Upar</h2>
        </div>
        <SellItem
          id="util-tec-ulti-tech"
          tier="gold"
          name="Util-Tec (Ulti-Tech)"
          meta="Ouro · Qtd. 1"
          note="Upe Util-Tec (Ulti-Tech) pra pelo menos Estelar antes do renascimento #33."
        />
        <p className="hint" style={{ marginTop: 8 }}>
          Suba o nível antes do renascimento que pede.
        </p>
      </section>

      <section className="sec" data-testid="sell-center-sellable">
        <div className="sec-h">
          <h2 className="t-h2">Vender</h2>
        </div>
        <SellItem
          id="mouse"
          tier="default"
          name="Mouse"
          meta="Padrão · Qtd. 2"
          note="Venda 1 Mouse extra. Só precisa de um pro que falta neste ciclo."
        />
        <p className="hint" style={{ marginTop: 8 }}>
          Não entra nos renascimentos que faltam; venda quando quiser.
        </p>
      </section>
    </>
  )
}
