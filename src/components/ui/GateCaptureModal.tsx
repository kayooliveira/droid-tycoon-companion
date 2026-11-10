import { createPortal } from 'react-dom'
import { isDesignGateCapture } from '../../e2e/designGate'
import { getOverlayRoot } from '../../lib/overlayRoot'

/** Modal markup aligned with `modal_wrap2()` in design mocks (gate 1:1 only). */
export function GateCaptureModal({
  open,
  title,
  hint,
  testId,
  primaryLabel,
  primaryVariant = 'primary',
  secondaryLabel = 'Cancelar',
  onPrimary,
  onClose,
  primaryTestId,
  secondaryTestId,
}: {
  open: boolean
  title: string
  hint: string
  testId: string
  primaryLabel: string
  primaryVariant?: 'primary' | 'danger-solid'
  secondaryLabel?: string
  onPrimary: () => void
  onClose: () => void
  primaryTestId?: string
  secondaryTestId?: string
}) {
  if (!open) return null

  const portalTarget =
    typeof document !== 'undefined' && isDesignGateCapture()
      ? document.querySelector<HTMLElement>('.app-shell.app') ?? getOverlayRoot()
      : getOverlayRoot()

  return createPortal(
    <>
      <div className="scrim" aria-hidden data-testid={`${testId}-scrim`} />
        <div className="modal-wrap">
          <div className="modal" role="dialog" aria-label={title} data-testid={testId} tabIndex={-1}>
            <div
              className="row2"
              style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <h2>{title}</h2>
              <button
                type="button"
                className="btn btn--icon btn--ghost"
                aria-label="Fechar"
                data-testid={`${testId}-close`}
                onClick={onClose}
              >
                <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
                  <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
                </svg>
              </button>
            </div>
            <p className="hint" style={{ margin: '10px 0 16px' }}>
              {hint}
            </p>
            <div className="modal-act">
              <button
                type="button"
                className="btn btn--secondary"
                data-testid={secondaryTestId}
                onClick={onClose}
              >
                {secondaryLabel}
              </button>
              <button
                type="button"
                className={`btn btn--${primaryVariant}`}
                data-testid={primaryTestId}
                onClick={onPrimary}
              >
                {primaryLabel}
              </button>
            </div>
          </div>
        </div>
    </>,
    portalTarget,
  )
}
