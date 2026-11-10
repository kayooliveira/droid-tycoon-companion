import { Link } from 'react-router-dom'
import { droidById } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'

/** `vazio-vender.html` (capture-only). */
export function SellEmptyGateView() {
  const emptyIds = ['kx', 'orb-walker', 'lo'] as const
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden>
        {emptyIds.map((id) => {
          const d = droidById.get(id)
          return d ? <DroidImage key={id} droid={d} tier="default" missing priority /> : null
        })}
      </div>
      <h2 className="t-h2">Cadastra o inventário pra ver o que vender</h2>
      <p className="hint">Marca os droids que você tem pra comparar com os próximos renascimentos.</p>
      <Link to="/inventory" className="btn btn--primary">
        Ir pro inventário
      </Link>
    </div>
  )
}
