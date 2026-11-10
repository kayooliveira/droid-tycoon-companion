import r2GateImage from '../../../dd-design/sistema/assets/droids/r2.webp'
import bbGateImage from '../../../dd-design/sistema/assets/droids/bb.webp'
import mouseGateImage from '../../../dd-design/sistema/assets/droids/mouse.webp'

const EMPTY_IMAGES = [r2GateImage, bbGateImage, mouseGateImage]

export function InventoryEmptyGateView({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden>
        {EMPTY_IMAGES.map((src) => (
          <span key={src} className="dtile dtile--missing" data-tier="default">
            <span className="dtile-bg" />
            <img src={src} alt="" width={128} height={128} loading="eager" />
            <span className="dtile-q">?</span>
          </span>
        ))}
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
