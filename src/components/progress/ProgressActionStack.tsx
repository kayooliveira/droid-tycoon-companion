import { useTranslation } from 'react-i18next'
import { isDesignGateCapture } from '../../e2e/designGate'

export function ProgressActionStack({
  showComplete,
  completeDisabled,
  onComplete,
  showSuper,
  onSuper,
  showForceComplete,
  onForceComplete,
  onUndo,
}: {
  showComplete: boolean
  completeDisabled?: boolean
  onComplete: () => void
  showSuper: boolean
  onSuper: () => void
  showForceComplete: boolean
  onForceComplete: () => void
  onUndo: () => void
}) {
  const { t } = useTranslation()
  const gate = isDesignGateCapture()

  if (!showComplete && !showSuper) return null

  return (
    <div className="stack" style={{ marginTop: 16 }} data-testid="progress-actions">
      {showComplete ? (
        <button
          type="button"
          className="btn btn--primary"
          data-testid="progress-complete-main"
          disabled={completeDisabled}
          onClick={onComplete}
        >
          {gate ? 'Concluir' : t('progress.completeShort')}
        </button>
      ) : null}
      {showComplete && showForceComplete ? (
        <button
          type="button"
          className="btn btn--secondary"
          data-testid="progress-force-complete-inline"
          onClick={onForceComplete}
        >
          {gate ? 'Concluir mesmo assim' : t('progress.completeAnyway')}
        </button>
      ) : null}
      {showSuper ? (
        <button
          type="button"
          className={showComplete ? 'btn btn--secondary' : 'btn btn--primary'}
          data-testid="progress-super-cta"
          onClick={onSuper}
        >
          {t('progress.superRebirthCta')}
        </button>
      ) : null}
      {showComplete || showSuper ? (
        <button
          type="button"
          className="btn btn--ghost"
          data-testid="progress-undo-inline"
          onClick={onUndo}
        >
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M9 5 4.5 9.5 9 14" />
            <path d="M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-3" />
          </svg>
          {gate ? 'Desfazer' : t('progress.undoOne')}
        </button>
      ) : null}
    </div>
  )
}
