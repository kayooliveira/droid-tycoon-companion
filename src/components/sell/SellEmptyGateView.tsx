import { useNavigate } from 'react-router-dom'
import { droidById } from '../../domain/gameData'
import { droidImageSrc } from '../../lib/images'

/** `vazio-vender.html` (capture-only). */
export function SellEmptyGateView() {
  const navigate = useNavigate()
  const emptyIds = ['kx', 'orb-walker', 'lo'] as const
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden>
        {emptyIds.map((id) => {
          const d = droidById.get(id)
          if (!d) return null
          return (
            <span key={id} className="dtile dtile--missing" data-tier="default">
              <span className="dtile-bg" aria-hidden />
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
        })}
      </div>
      <h2 className="t-h2">Cadastra o inventário pra ver o que vender</h2>
      <p className="hint">Marca os droids que você tem pra comparar com os próximos renascimentos.</p>
      <button type="button" className="btn btn--primary" onClick={() => navigate('/inventory')}>
        Ir pro inventário
      </button>
    </div>
  )
}
