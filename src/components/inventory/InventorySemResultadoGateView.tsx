/** `inventario-sem-resultado.html` empty filter body (capture-only). */
export function InventorySemResultadoGateView({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div className="row">
        <span className="row-main">
          <span className="hint">
            Cadastre os droids da sua base pra comparar com o próximo renascimento.
          </span>
        </span>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="btn btn--secondary" onClick={onAdd}>
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adicionar droid
        </button>
      </div>
    </div>
  )
}
