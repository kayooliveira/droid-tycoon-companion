import { useState } from 'react'
import { CaretDown, Path } from '@phosphor-icons/react'
import { UI_ICON_SIZE, UI_ICON_WEIGHT } from './ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { cycleById, gameData } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { RadioCardGroup } from './ui/RadioCardGroup'

export function PathProgressSwitcher({ compact }: { compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const switchPath = useAppStore((s) => s.switchPath)
  const { push } = useToast()
  const cycleLabel = (id: string) =>
    formatCycleDisplayName(cycleById.get(id)?.name ?? id, i18n.language)

  const [open, setOpen] = useState(false)
  const [targetPath, setTargetPath] = useState(progress.pathId)
  const [resetProgress, setResetProgress] = useState(false)

  const openSwitch = () => {
    setTargetPath(progress.pathId)
    setResetProgress(false)
    setOpen(true)
  }

  const confirm = () => {
    if (targetPath === progress.pathId) {
      setOpen(false)
      return
    }
    switchPath(targetPath, { resetProgress })
    push(t('path.switched', { name: cycleLabel(targetPath) }), { variant: 'info' })
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={openSwitch}
        data-testid="path-switcher-trigger"
        className={compact ? 'sel' : 'inline-flex items-center gap-2 rounded-xl border border-ui bg-ui-hover px-4 py-2 text-sm hover:bg-ui-hover-strong'}
        aria-label={`${t('path.switchTitle')} ${cycleLabel(progress.pathId)}`}
      >
        <Path size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} className="ic shrink-0" aria-hidden />
        <span className="truncate max-w-[10rem]">{cycleLabel(progress.pathId)}</span>
        <CaretDown size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} className="ic shrink-0" aria-hidden />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('path.switchTitle')}
        testId="path-switch-modal"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="path-switch-cancel"
              onClick={() => setOpen(false)}
            >
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="path-switcher-confirm" onClick={confirm}>
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ui-secondary text-pretty">
            {t('path.switchBody', { name: cycleLabel(targetPath) })}
          </p>
          {resetProgress ? (
            <p className="text-sm text-ui-warn/90 text-pretty">
              {t('path.switchBodyReset', { name: cycleLabel(targetPath) })}
            </p>
          ) : null}
          <RadioCardGroup
            ariaLabel={t('settings.path')}
            value={targetPath}
            onChange={setTargetPath}
            columns={3}
            optionTestIdPrefix="path-switcher-option"
            options={gameData.cycles.map((c) => ({
              value: c.id,
              label: formatCycleDisplayName(c.name, i18n.language),
            }))}
          />
          <label className="switch-row">
            <span>{t('path.resetRebirthOnSwitch')}</span>
            <span className="switch">
              <input
                type="checkbox"
                role="switch"
                checked={resetProgress}
                onChange={(e) => setResetProgress(e.target.checked)}
                aria-label={t('path.resetRebirthOnSwitch')}
              />
              <i aria-hidden />
            </span>
          </label>
        </div>
      </Modal>
    </>
  )
}

export function ProgressSummaryLine() {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  return (
    <p className="text-sm text-ui-muted">
      {t('progress.completed')}: <span className="text-ui-fg">{progress.completedOnPath}</span>
      {' · '}
      {t('progress.nextRebirth')}:{' '}
      <span className="text-ui-fg">#{Math.min(progress.nextRebirth, 40)}</span>
    </p>
  )
}
