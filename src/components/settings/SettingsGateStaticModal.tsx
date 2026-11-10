import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const MODAL_IMPORT_OVERLAY =
  '<div class="scrim"></div><div class="modal-wrap"><div class="modal" role="dialog" aria-label="Importar progresso?" data-testid="modal-importar"><div class="row2" style="justify-content:space-between;align-items:flex-start"><h2>Importar progresso?</h2><button class="btn btn--icon btn--ghost" aria-label="Fechar"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg></button></div><p class="hint" style="margin:10px 0 16px">Substitui inventário, ciclo e renascimentos pelos dados do arquivo. Não dá para desfazer.</p><div class="modal-act"><button class="btn btn--secondary " >Cancelar</button><button class="btn btn--primary " >Confirmar</button></div></div></div>'

const MODAL_RESET_OVERLAY =
  '<div class="scrim"></div><div class="modal-wrap"><div class="modal" role="dialog" aria-label="Apagar tudo?" data-testid="modal-apagar-tudo"><div class="row2" style="justify-content:space-between;align-items:flex-start"><h2>Apagar tudo?</h2><button class="btn btn--icon btn--ghost" aria-label="Fechar"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg></button></div><p class="hint" style="margin:10px 0 16px">Remove progresso, inventário e ajustes deste aparelho. Não dá para desfazer.</p><div class="modal-act"><button class="btn btn--secondary " >Cancelar</button><button class="btn btn--danger-solid " >Confirmar</button></div></div></div>'

/** Static overlay HTML from design mocks (gate 1:1 only). */
export function SettingsGateStaticModal({
  open,
  testId,
}: {
  open: boolean
  testId: 'modal-importar' | 'modal-apagar-tudo'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const portalTarget = document.querySelector<HTMLElement>('.app-shell.app')
  if (!portalTarget) return null

  const html = testId === 'modal-importar' ? MODAL_IMPORT_OVERLAY : MODAL_RESET_OVERLAY

  return createPortal(
    <div
      className="settings-gate-modal-overlay"
      data-testid={`${testId}-overlay-root`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />,
    portalTarget,
  )
}
