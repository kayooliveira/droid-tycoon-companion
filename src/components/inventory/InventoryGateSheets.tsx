import { useLayoutEffect, useRef } from 'react'
import { droidById } from '../../domain/gameData'
import { droidImageSrc } from '../../lib/images'
import { OverlayPortal } from '../ui/OverlayPortal'

const PICK_IDS = ['bb', 'r7', 'mouse', 'kx', 'lep', 'cyclens'] as const

const TIER_CHIPS = [
  'Padrão',
  'Ouro',
  'Diamante',
  'Arco-íris',
  'Beskar',
  'Galáctico',
  'Estelar',
  'Kyber',
  'Scourge',
] as const

const TIER_CHIP_INDEX = 5

function PickButton({ id, selected }: { id: string; selected: boolean }) {
  const droid = droidById.get(id)
  if (!droid) return null
  return (
    <button type="button" className="pick" aria-pressed={selected}>
      <span className="dtile dtile--xs" data-tier="default">
        <span className="dtile-bg" aria-hidden />
        <img
          src={droidImageSrc(droid.id, droid.imageLocal)}
          alt=""
          width={48}
          height={48}
          loading="eager"
        />
      </span>
      <span className="dname">{droid.name}</span>
    </button>
  )
}

/** `sheet-adicionar-droid.html` overlay (capture-only). */
export function InventoryAddGateSheet({ onClose }: { onClose: () => void }) {
  const chipsRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const alignChips = () => {
      const c = chipsRef.current
      if (!c) return
      const selected = c.querySelector<HTMLElement>('[aria-pressed="true"]')
      if (selected) c.scrollLeft = Math.max(0, selected.offsetLeft - c.offsetLeft - 17)
    }
    alignChips()
    void document.fonts?.ready?.then(alignChips)
  }, [])
  return (
    <OverlayPortal>
      <button type="button" className="scrim" aria-label="Fechar" onClick={onClose} />
      <section
        className="sheet"
        role="dialog"
        aria-label="Adicionar droid"
        data-testid="inventory-add-modal"
      >
        <span className="grab" aria-hidden />
        <div className="sheet-h">
          <h2 className="t-h2">Adicionar droid</h2>
          <button type="button" className="btn btn--icon btn--secondary" aria-label="Fechar" onClick={onClose}>
            <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
              <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
            </svg>
          </button>
        </div>
        <div className="field-wrap">
          <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m20 20-4.9-4.9" />
          </svg>
          <input className="field" type="search" placeholder="Buscar droids…" aria-label="Buscar droids" />
        </div>
        <div className="grid2" style={{ marginTop: 12, gap: 8 }}>
          {PICK_IDS.map((id, i) => (
            <PickButton key={id} id={id} selected={i === 1} />
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <span className="lbl">Nível deste droid</span>
          <div ref={chipsRef} className="chips chips--scroll" role="group">
            {TIER_CHIPS.map((label, i) => (
              <button
                key={label}
                type="button"
                className="chip"
                aria-pressed={i === TIER_CHIP_INDEX}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="row2" style={{ justifyContent: 'space-between', marginTop: 12 }}>
          <span className="dname">Quantidade</span>
          <div className="stepper">
            <button type="button" className="btn btn--icon btn--secondary" aria-label="Diminuir">
              <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="stepper-val">1</span>
            <button type="button" className="btn btn--icon btn--primary" aria-label="Aumentar">
              <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn--primary" data-testid="inventory-add-confirm">
            Adicionar
          </button>
        </div>
      </section>
    </OverlayPortal>
  )
}

/** `sheet-remover-inventario.html` (capture-only). */
export function InventoryRemoveGateSheet({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <OverlayPortal>
      <button type="button" className="scrim" aria-label="Fechar" onClick={onClose} />
      <section
        className="sheet"
        role="alertdialog"
        aria-label="Remover do inventário?"
        data-testid="inventory-remove-modal"
      >
        <span className="grab" aria-hidden />
        <div className="sheet-h">
          <h2 className="t-h2">Remover do inventário?</h2>
          <button type="button" className="btn btn--icon btn--ghost" aria-label="Fechar" onClick={onClose}>
            <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
              <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
            </svg>
          </button>
        </div>
        <p className="hint" style={{ marginBottom: 16 }}>
          Remove LEP (Kyber) da sua lista. Você pode adicionar de novo depois.
        </p>
        <div className="grid2">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--danger-solid"
            data-testid="inventory-remove-confirm"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </section>
    </OverlayPortal>
  )
}
