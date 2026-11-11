<cursor_untrusted_data_1337 source="CallDynamicTool">

import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { uiIconProps } from '../ui/iconStyle'

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

  return (
    <div className="dc-action-stack" data-testid="progress-actions">
      {showComplete ? (
        <Button
          variant="primary"
          className="w-full min-h-12"
          data-testid="progress-complete-main"
          disabled={completeDisabled}
          onClick={onComplete}
        >
          {t('progress.completeShort')}
        </Button>
      ) : null}
      {showSuper ? (
        <Button variant="accentSoft" className="w-full min-h-12" data-testid="progress-super-cta" onClick={onSuper}>
          {t('progress.superRebirthCta')}
        </Button>
      ) : null}
      {showForceComplete ? (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          data-testid="progress-force-complete-inline"
          onClick={onForceComplete}
        >
          {t('progress.completeAnyway')}
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        data-testid="progress-undo-inline"
        icon={<ArrowCounterClockwise {...uiIconProps} />}
        onClick={onUndo}
      >
        {t('progress.undoOne')}
      </Button>
    </div>
  )
}


</cursor_untrusted_data_1337>