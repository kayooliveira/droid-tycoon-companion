import { useState } from 'react'
import { ChevronDown, Route } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cycleById, gameData } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

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
        <Route size={compact ? 14 : 16} className="text-holo-300 shrink-0" />
        <span className="truncate max-w-[10rem]">{cycleLabel(progress.pathId)}</span>
        <ChevronDown size={14} className="opacity-60 shrink-0" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('path.switchTitle')}>
        <div className="space-y-4 text-sm">
          <p className="text-zinc-400">{t('path.switchBody', { name: cycleLabel(targetPath) })}</p>
          <label className="block">
            <span className="text-zinc-300 mb-1 block">{t('settings.path')}</span>
            <select
              className="w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2"
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              data-testid="path-switcher-select"
            >
              {gameData.cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatCycleDisplayName(c.name, i18n.language)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-2 text-zinc-300">
            <input
              type="checkbox"
              className="mt-1"
              checked={resetProgress}
              onChange={(e) => setResetProgress(e.target.checked)}
            />
            <span>{t('path.resetRebirthOnSwitch')}</span>
          </label>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              {t('path.cancel')}
            </Button>
            <Button className="flex-1" data-testid="path-switcher-confirm" onClick={confirm}>
              {t('path.confirmSwitch')}
            </Button>
          </div>
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
