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
import { Switch } from './ui/Switch'

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
    push(t('path.switched', { name: cycleLabel(targetPath) }))
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={openSwitch}
        data-testid="path-switcher-trigger"
        className={
          compact
            ? 'inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10'
            : 'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10'
        }
      >
        <Path size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} className="text-holo-300 shrink-0" />
        <span className="truncate max-w-[10rem]">{cycleLabel(progress.pathId)}</span>
        <CaretDown size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} className="opacity-60 shrink-0" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('path.switchTitle')}
        testId="path-switch-modal"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="path-switcher-confirm" onClick={confirm}>
              {t('path.confirmSwitch')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
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
          <Switch
            label={t('path.resetRebirthOnSwitch')}
            checked={resetProgress}
            onChange={setResetProgress}
          />
        </div>
      </Modal>
    </>
  )
}

export function ProgressSummaryLine() {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  return (
    <p className="text-sm text-zinc-400">
      {t('progress.completed')}: <span className="text-zinc-200">{progress.completedOnPath}</span>
      {' · '}
      {t('progress.nextRebirth')}:{' '}
      <span className="text-zinc-200">#{Math.min(progress.nextRebirth, 40)}</span>
    </p>
  )
}
