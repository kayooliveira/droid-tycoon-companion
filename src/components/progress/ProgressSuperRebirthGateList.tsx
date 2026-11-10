import { droidById } from '../../domain/gameData'
import { droidImageSrc } from '../../lib/images'

type MiniTile = { id: string; tier: string; num?: string; missing?: boolean }

type Accordion = {
  rebirth: number
  open: boolean
  tag?: 'done' | 'current'
  minis: MiniTile[]
  rows?: { id: string; tier: string; num: string; meta: string; status: 'ok' | 'bad' }[]
}

const ACCORDIONS: Accordion[] = [
  {
    rebirth: 29,
    open: false,
    tag: 'done',
    minis: [
      { id: 'lo', tier: 'galactic', num: '06' },
      { id: 'trak-r', tier: 'galactic', num: '06' },
      { id: 'drft-r', tier: 'beskar', num: '05' },
    ],
  },
  {
    rebirth: 30,
    open: true,
    tag: 'current',
    minis: [
      { id: 'r7', tier: 'galactic', num: '06' },
      { id: 'lep', tier: 'beskar', num: '05' },
      { id: 'cyclens', tier: 'galactic', num: '06' },
    ],
    rows: [
      { id: 'r7', tier: 'galactic', num: '06', meta: 'Lendário · Galáctico', status: 'ok' },
      { id: 'lep', tier: 'beskar', num: '05', meta: 'Mítico · Beskar', status: 'ok' },
      { id: 'cyclens', tier: 'galactic', num: '06', meta: 'Mítico · Galáctico', status: 'bad' },
    ],
  },
  {
    rebirth: 31,
    open: false,
    minis: [
      { id: 'pit', tier: 'stellar', missing: true },
      { id: 'opti-strk', tier: 'beskar', num: '05' },
      { id: 'pit', tier: 'beskar', missing: true },
    ],
  },
  {
    rebirth: 32,
    open: false,
    minis: [
      { id: 'lo', tier: 'galactic', num: '06' },
      { id: 'trak-r', tier: 'galactic', num: '06' },
      { id: 'drft-r', tier: 'beskar', num: '05' },
    ],
  },
]

function XsTile({ tile }: { tile: MiniTile }) {
  const d = droidById.get(tile.id)
  if (!d) return null
  const cls = tile.missing ? 'dtile dtile--xs dtile--missing' : 'dtile dtile--xs'
  return (
    <span className={cls} data-tier={tile.tier}>
      <span className="dtile-bg" aria-hidden />
      {tile.num ? (
        <span className="dtile-num" aria-hidden>
          {tile.num}
        </span>
      ) : null}
      <img
        src={droidImageSrc(d.id, d.imageLocal)}
        alt=""
        width={128}
        height={128}
        loading="eager"
      />
      <span className="dtile-q" aria-hidden>
        ?
      </span>
    </span>
  )
}

function SmTile({ droidId, tier, num }: { droidId: string; tier: string; num: string }) {
  const d = droidById.get(droidId)
  if (!d) return null
  return (
    <span className="dtile dtile--sm" data-tier={tier}>
      <span className="dtile-bg" aria-hidden />
      <span className="dtile-num" aria-hidden>
        {num}
      </span>
      <img
        src={droidImageSrc(d.id, d.imageLocal)}
        alt=""
        width={128}
        height={128}
        loading="eager"
      />
      <span className="dtile-q" aria-hidden>
        ?
      </span>
    </span>
  )
}

/** Renascimento list slice for `progresso-super.html` (capture-only). */
export function ProgressSuperRebirthGateList() {
  return (
    <>
      <div className="sec-h sec-h--act">
        <h2 className="t-h2">Renascimentos</h2>
        <button type="button" className="link-btn" aria-expanded={false}>
          Recolher todos
        </button>
      </div>
      {ACCORDIONS.map((acc) => (
        <div className="acc" key={acc.rebirth} id={`progress-step-${acc.rebirth}`}>
          <button type="button" className="acc-h" aria-expanded={acc.open}>
            <span className="row-main">
              <span className="dname" style={{ display: 'block' }}>
                Renascimento #{acc.rebirth}
              </span>
              <span className="mini-tiles" style={{ marginTop: 6 }}>
                {acc.minis.map((tile, i) => (
                  <XsTile key={`${acc.rebirth}-${tile.id}-${i}`} tile={tile} />
                ))}
              </span>
            </span>
            {acc.tag === 'done' ? (
              <span className="tag tag--ok">
                <i className="tag-sq" aria-hidden />
                <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                  <path d="m4.5 12.5 5 5L19.5 7" />
                </svg>
                Feito
              </span>
            ) : null}
            {acc.tag === 'current' ? (
              <span className="tag tag--mute">
                <i className="tag-sq" aria-hidden />
                <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Atual
              </span>
            ) : null}
            <span className="chev" aria-hidden>
              <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
                <path d={acc.open ? 'm5 9 7 7 7-7' : 'm9 5 7 7-7 7'} />
              </svg>
            </span>
          </button>
          {acc.open && acc.rows ? (
            <div className="acc-body">
              {acc.rows.map((row) => {
                const d = droidById.get(row.id)
                if (!d) return null
                return (
                  <div key={row.id} className="item">
                    <button type="button" className="item-open" aria-label={`Abrir ${d.name}`}>
                      <SmTile droidId={row.id} tier={row.tier} num={row.num} />
                      <span className="item-body">
                        <span className="dname">{d.name}</span>
                        <span className="t-meta">{row.meta}</span>
                        <span className={row.status === 'ok' ? 'tag tag--ok' : 'tag tag--bad'}>
                          <i className="tag-sq" aria-hidden />
                          <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                            {row.status === 'ok' ? (
                              <path d="m4.5 12.5 5 5L19.5 7" />
                            ) : (
                              <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
                            )}
                          </svg>
                          {row.status === 'ok' ? 'Ok' : 'Falta'}
                        </span>
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ))}
    </>
  )
}
