import { droidById } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'

const EMPTY_IDS = ['r2', 'bb', 'mouse'] as const

export function InventoryEmptyGateView({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden>
        {EMPTY_IDS.map((id) => {
          const d = droidById.get(id)
          return d ? <DroidImage key={id} droid={d} tier="default" missing priority /> : null
        })}
      </div>
      <h2 className="t-h2">Nenhum droid ainda.</h2>
      <p className="hint">Cadastre os droids da sua base pra comparar com o próximo renascimento.</p>
      <button type="button" className="btn btn--primary" data-testid="inventory-add-open" onClick={onAdd}>
        <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Adicionar droid
      </button>
    </div>
  )
}
