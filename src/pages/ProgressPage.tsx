import { motion } from 'motion/react'
import { useState } from 'react'
import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  droidById,
  DISPUTED_REBIRTH_ALTERNATIVES,
  getDisputeKey,
  getRebirth,
} from '../domain/gameData'
import {
  canCompleteRebirth,
  canSuperRebirth,
  isPathComplete,
  SUPER_REBIRTH_UNLOCK_AFTER,
} from '../domain/progress'
import { evaluateRequirements, metRequirementCount } from '../domain/requirements'
import { buildTierLabelMap, formatTierName } from '../domain/tiers'
import { gameData } from '../domain/gameData'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { RequirementCard } from '../components/RequirementCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { Modal } from '../components/ui/Modal'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAppStore } from '../store/useAppStore'
import { useToast } from '../components/ToastProvider'

const tierLabels = buildTierLabelMap(gameData.rarities)

export function ProgressPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'list' | 'focus'>('focus')
  const [forceCompleteOpen, setForceCompleteOpen] = useState(false)
  const [undoOpen, setUndoOpen] = useState(false)
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const completeRebirthAdvance = useAppStore((s) => s.completeRebirthAdvance)
  const undoRebirthStep = useAppStore((s) => s.undoRebirthStep)
  const superRebirthAdvance = useAppStore((s) => s.superRebirthAdvance)
  const animations = useAppStore((s) => s.settings.animationsEnabled)
  const { push } = useToast()

  const current = getRebirth(progress.pathId, progress.nextRebirth)
  const canComplete = current
    ? canCompleteRebirth(progress.pathId, current.rebirth, inventory, trackInventory)
    : false

  const handleCompleteClick = () => {
    if (!current) return
    if (canComplete || !trackInventory) {
      completeRebirthAdvance()
      return
    }
    setForceCompleteOpen(true)
  }

  const confirmForceComplete = () => {
    completeRebirthAdvance()
    setForceCompleteOpen(false)
  }

  const confirmUndo = () => {
    undoRebirthStep()
    setUndoOpen(false)
    push(t('progress.undoOne'))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-display text-2xl tracking-wide">{t('nav.progress')}</h1>
          <PathProgressSwitcher compact />
          <ProgressSummaryLine />
        </div>
        <div className="flex rounded-xl border border-white/10 p-1">
          {(['focus', 'list'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
                mode === m ? 'bg-white/10' : 'text-zinc-400'
              }`}
            >
              {t(`progress.${m}`)}
            </button>
          ))}
        </div>
      </div>

      {mode === 'focus' ? (
        <GlassCard className="space-y-4">
          {current ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-display text-lg">
                  {t('progress.workingOn', { n: current.rebirth })}
                </h2>
                <Badge tone={current.confidence === 'confirmed' ? 'success' : 'warn'}>
                  {t(`confidence.${current.confidence}`)}
                </Badge>
              </div>
              {getDisputeKey(progress.pathId, current.rebirth) ? (
                <DisputePanel pathId={progress.pathId} rebirth={current.rebirth} />
              ) : null}
              <div className="space-y-2">
                {evaluateRequirements(current.requirements, inventory, trackInventory).map(
                  (c) => (
                    <RequirementCard key={c.requirement.droidId} check={c} />
                  ),
                )}
              </div>
              {!canComplete && trackInventory ? (
                <p className="text-sm text-amber-200/90 border border-amber-400/20 rounded-lg p-3">
                  {t('progress.completeBlocked')}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={handleCompleteClick} disabled={trackInventory && !canComplete}>
                  {t('progress.completeRebirth')}
                </Button>
                {trackInventory && !canComplete ? (
                  <Button variant="secondary" onClick={() => setForceCompleteOpen(true)}>
                    {t('progress.completeAnyway')}
                  </Button>
                ) : null}
                <Button variant="secondary" onClick={() => setUndoOpen(true)}>
                  <RotateCcw size={16} /> {t('progress.undoOne')}
                </Button>
              </div>
              {canSuperRebirth(progress) ? (
                <Button variant="secondary" onClick={() => superRebirthAdvance()}>
                  <Sparkles size={16} /> {t('progress.superRebirth')}
                </Button>
              ) : (
                <p className="text-xs text-zinc-500">
                  {t('progress.superHint', { n: SUPER_REBIRTH_UNLOCK_AFTER })}
                </p>
              )}
              {animations ? (
                <motion.div layout className="h-1 rounded-full bg-gradient-to-r from-holo-600 to-accent-cyan" />
              ) : null}
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              {isPathComplete(progress) ? t('progress.pathComplete') : '—'}
            </p>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {gameData.cycles
            .find((c) => c.id === progress.pathId)
            ?.rebirths.map((r) => (
              <RebirthListItem
                key={r.rebirth}
                pathId={progress.pathId}
                rebirth={r.rebirth}
                active={r.rebirth === progress.nextRebirth}
                nextRebirth={progress.nextRebirth}
                inventory={inventory}
                trackInventory={trackInventory}
              />
            ))}
        </div>
      )}

      <Modal open={forceCompleteOpen} onClose={() => setForceCompleteOpen(false)} title={t('progress.completeAnyway')}>
        <p className="text-sm text-zinc-400 mb-4">{t('progress.completeBlocked')}</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setForceCompleteOpen(false)}>
            {t('path.cancel')}
          </Button>
          <Button className="flex-1" onClick={confirmForceComplete}>
            {t('progress.completeAnyway')}
          </Button>
        </div>
      </Modal>

      <Modal open={undoOpen} onClose={() => setUndoOpen(false)} title={t('progress.undoOne')}>
        <p className="text-sm text-zinc-400 mb-4">{t('progress.undoConfirm')}</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setUndoOpen(false)}>
            {t('path.cancel')}
          </Button>
          <Button className="flex-1" onClick={confirmUndo}>
            {t('progress.undoOne')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function DisputePanel({ pathId, rebirth }: { pathId: string; rebirth: number }) {
  const { t } = useTranslation()
  const key = getDisputeKey(pathId, rebirth)
  if (!key) return null
  const dispute = DISPUTED_REBIRTH_ALTERNATIVES[key]
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-3 text-xs space-y-2">
      <p className="text-amber-100 font-medium">{t('dispute.title')}</p>
      <p className="text-amber-200/80">
        {key === 'path-2:17' ? t('dispute.path2r17') : t('dispute.path6r19')}
      </p>
      <ul className="space-y-1">
        {dispute.alternatives.map((alt) => (
          <li key={alt.label} className="text-zinc-300">
            <span className="text-zinc-400">{alt.label}: </span>
            {alt.requirements
              .map(
                (req) =>
                  `${droidById.get(req.droidId)?.name ?? req.droidId} ${formatTierName(req.rarity, tierLabels)}`,
              )
              .join(', ')}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RebirthListItem({
  pathId,
  rebirth,
  active,
  nextRebirth,
  inventory,
  trackInventory,
}: {
  pathId: string
  rebirth: number
  active: boolean
  nextRebirth: number
  inventory: ReturnType<typeof useAppStore.getState>['inventory']
  trackInventory: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(active)
  const entry = getRebirth(pathId, rebirth)
  if (!entry) return null
  const done = rebirth < nextRebirth
  const checks = evaluateRequirements(entry.requirements, inventory, trackInventory)

  return (
    <GlassCard className={active ? 'ring-1 ring-holo-400/40' : ''}>
      <button
        type="button"
        className="w-full flex items-center gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} size={16} />
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            Rebirth {rebirth}{' '}
            {done ? <Badge tone="success">{t('progress.listDone')}</Badge> : null}
            {active ? <Badge tone="info">{t('progress.listCurrent')}</Badge> : null}
          </p>
          <p className="text-xs text-zinc-500">{entry.credits}</p>
        </div>
        {trackInventory && !done ? (
          <span className="text-xs text-zinc-400 shrink-0">
            {metRequirementCount(checks)}/3 {t('dashboard.statsReady').toLowerCase()}
          </span>
        ) : done ? (
          <span className="text-xs text-emerald-400 shrink-0">{t('progress.listCompletedState')}</span>
        ) : null}
      </button>
      {open ? (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {entry.note ? <p className="text-xs text-amber-200/90">{entry.note}</p> : null}
          {!done &&
            checks.map((c) => <RequirementCard key={c.requirement.droidId} check={c} />)}
          {!done && trackInventory ? (
            <ProgressBar value={(metRequirementCount(checks) / 3) * 100} />
          ) : null}
        </div>
      ) : null}
    </GlassCard>
  )
}
