import { motion } from 'motion/react'
import { useState } from 'react'
import { ArrowCounterClockwise, CaretDown, Check, DotsThreeVertical, Sparkle } from '@phosphor-icons/react'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { uiIconProps } from '../components/ui/iconStyle'
import { useTranslation } from 'react-i18next'
import {
  cycleById,
  droidById,
  DISPUTED_REBIRTH_ALTERNATIVES,
  getDisputeKey,
  getNextPathId,
  getRebirth,
} from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import {
  canCompleteRebirth,
  canSuperRebirth,
  isPathComplete,
  SUPER_REBIRTH_UNLOCK_AFTER,
} from '../domain/progress'
import { evaluateRequirements, metRequirementCount } from '../domain/requirements'
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
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
import { SellAfterRebirthList } from '../components/SellAfterRebirthList'
import { ProgressPdfExport } from '../components/ProgressPdfExport'
import { HelpHint } from '../components/ui/HelpHint'
import { IconButton } from '../components/ui/IconButton'
import { hapticTap } from '../lib/haptics'

export function ProgressPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const [mode, setMode] = useState<'list' | 'focus'>('focus')
  const [forceCompleteOpen, setForceCompleteOpen] = useState(false)
  const [undoOpen, setUndoOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [superConfirmOpen, setSuperConfirmOpen] = useState(false)
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false)
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

  const advanceWithToast = () => {
    completeRebirthAdvance()
    hapticTap()
    push(t('progress.rebirthCompleted'))
  }

  const cycleLabel = (pathId: string) =>
    formatCycleDisplayName(cycleById.get(pathId)?.name ?? pathId, i18n.language)
  const nextPathId = getNextPathId(progress.pathId)

  const handleCompleteClick = () => {
    if (!current) return
    if (canComplete || !trackInventory) {
      setCompleteConfirmOpen(true)
      return
    }
    setForceCompleteOpen(true)
  }

  const confirmComplete = () => {
    advanceWithToast()
    setCompleteConfirmOpen(false)
  }

  const confirmForceComplete = () => {
    advanceWithToast()
    setForceCompleteOpen(false)
  }

  const confirmSuperRebirth = () => {
    superRebirthAdvance()
    hapticTap()
    setSuperConfirmOpen(false)
    push(t('path.switched', { name: cycleLabel(nextPathId) }))
  }

  const confirmUndo = () => {
    undoRebirthStep()
    setUndoOpen(false)
    push(t('progress.undoOne'))
  }

  return (
    <div className="space-y-5 pb-6 md:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="hidden md:block font-display text-xl tracking-wide text-balance">{t('nav.progress')}</h1>
          <PathProgressSwitcher compact />
          <ProgressSummaryLine />
        </div>
        <SegmentedControl
          ariaLabel={t('progress.viewMode')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'focus', label: t('progress.focus') },
            { value: 'list', label: t('progress.list') },
          ]}
        />
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
                <DisputePanel
                  pathId={progress.pathId}
                  rebirth={current.rebirth}
                  tierLabels={tierLabels}
                />
              ) : null}
              <div className="space-y-2">
                {evaluateRequirements(current.requirements, inventory, trackInventory).map(
                  (c) => (
                    <RequirementCard key={c.requirement.droidId} check={c} />
                  ),
                )}
              </div>
              {canSuperRebirth(progress) ? (
                <div className="flex flex-col gap-2 pt-1 w-full min-w-0" data-testid="progress-super-actions">
                  <Button
                    variant="accent"
                    size="md"
                    className="w-full min-h-12 max-w-full"
                    data-testid="progress-super-cta"
                    icon={<Sparkle {...uiIconProps} weight="fill" />}
                    onClick={() => setSuperConfirmOpen(true)}
                  >
                    {t('progress.superRebirthCta')}
                  </Button>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    {!isPathComplete(progress) ? (
                      <Button
                        size="sm"
                        icon={<Check {...uiIconProps} weight="fill" />}
                        onClick={handleCompleteClick}
                        disabled={trackInventory && !canComplete}
                        className="flex-1 min-w-0 max-w-full"
                      >
                        {t('progress.completeShort')}
                      </Button>
                    ) : null}
                    <IconButton
                      variant="soft"
                      className="shrink-0"
                      data-testid="progress-more-trigger"
                      label={t('progress.moreActionsTitle')}
                      onClick={() => setMoreOpen(true)}
                    >
                      <DotsThreeVertical {...uiIconProps} weight="fill" />
                    </IconButton>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1 w-full min-w-0">
                  <Button
                    size="sm"
                    icon={<Check {...uiIconProps} weight="fill" />}
                    onClick={handleCompleteClick}
                    disabled={trackInventory && !canComplete}
                    className="flex-1 min-w-0 max-w-full sm:flex-none"
                  >
                    {t('progress.completeShort')}
                  </Button>
                  <HelpHint
                    testId="progress-super-hint"
                    label={t('progress.superShort')}
                    text={t('progress.superHint', { n: SUPER_REBIRTH_UNLOCK_AFTER })}
                  />
                  <IconButton
                    variant="soft"
                    className="shrink-0"
                    data-testid="progress-more-trigger"
                    label={t('progress.moreActionsTitle')}
                    onClick={() => setMoreOpen(true)}
                  >
                    <DotsThreeVertical {...uiIconProps} weight="fill" />
                  </IconButton>
                </div>
              )}
              <SellAfterRebirthList
                pathId={progress.pathId}
                afterRebirth={current.rebirth}
              />
              {animations ? (
                <motion.div layout className="h-1 rounded-full bg-gradient-to-r from-holo-600 to-accent-cyan" />
              ) : null}
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              {isPathComplete(progress) ? t('progress.pathComplete') : t('progress.listCurrent')}
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

      <ProgressPdfExport />

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={t('progress.moreActionsTitle')}
        testId="progress-more-modal"
        footer={
          <Button
            variant="secondary"
            size="sm"
            data-testid="progress-more-cancel"
            onClick={() => setMoreOpen(false)}
          >
            {t('path.cancel')}
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          {trackInventory && !canComplete ? (
            <Button
              size="sm"
              variant="secondary"
              data-testid="progress-more-force-complete"
              onClick={() => {
                setMoreOpen(false)
                setForceCompleteOpen(true)
              }}
            >
              {t('progress.completeAnyway')}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="secondary"
            data-testid="progress-more-undo"
            icon={<ArrowCounterClockwise {...uiIconProps} />}
            onClick={() => {
              setMoreOpen(false)
              setUndoOpen(true)
            }}
          >
            {t('progress.undoOne')}
          </Button>
          {canSuperRebirth(progress) ? (
            <Button
              size="sm"
              variant="accent"
              icon={<Sparkle {...uiIconProps} weight="fill" />}
              onClick={() => {
                setMoreOpen(false)
                setSuperConfirmOpen(true)
              }}
            >
              {t('progress.superRebirthCta')}
            </Button>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={forceCompleteOpen}
        onClose={() => setForceCompleteOpen(false)}
        title={t('progress.completeAnyway')}
        testId="progress-force-complete-modal"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="progress-force-cancel"
              onClick={() => setForceCompleteOpen(false)}
            >
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="progress-force-confirm" onClick={confirmForceComplete}>
              {t('progress.completeShort')}
            </Button>
          </>
        }
      >
        <p className="text-xs text-zinc-400 text-pretty">{t('progress.completeBlockedShort')}</p>
      </Modal>

      <Modal
        open={superConfirmOpen}
        onClose={() => setSuperConfirmOpen(false)}
        title={t('progress.superConfirmTitle')}
        testId="progress-super-confirm-modal"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="progress-super-cancel"
              onClick={() => setSuperConfirmOpen(false)}
            >
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="progress-super-confirm" onClick={confirmSuperRebirth}>
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-300 text-pretty">
          {t('progress.superConfirmBody', {
            currentCycle: cycleLabel(progress.pathId),
            nextCycle: cycleLabel(nextPathId),
            currentStep: progress.nextRebirth,
          })}
        </p>
      </Modal>

      <Modal
        open={completeConfirmOpen}
        onClose={() => setCompleteConfirmOpen(false)}
        title={t('progress.completeConfirmTitle')}
        testId="progress-complete-confirm-modal"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="progress-complete-cancel"
              onClick={() => setCompleteConfirmOpen(false)}
            >
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="progress-complete-confirm" onClick={confirmComplete}>
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-300 text-pretty">
          {current
            ? t('progress.completeConfirmBody', {
                n: current.rebirth,
                next: Math.min(current.rebirth + 1, 40),
              })
            : null}
        </p>
      </Modal>

      <Modal
        open={undoOpen}
        onClose={() => setUndoOpen(false)}
        title={t('progress.undoOne')}
        testId="progress-undo-modal"
        footer={
          <>
            <Button variant="secondary" size="sm" data-testid="progress-undo-cancel" onClick={() => setUndoOpen(false)}>
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="progress-undo-confirm" onClick={confirmUndo}>
              {t('progress.undoConfirmShort')}
            </Button>
          </>
        }
      >
        <p className="text-xs text-zinc-400 text-pretty">{t('progress.undoConfirm')}</p>
      </Modal>
    </div>
  )
}

function DisputePanel({
  pathId,
  rebirth,
  tierLabels,
}: {
  pathId: string
  rebirth: number
  tierLabels: Map<string, string>
}) {
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
          <li key={alt.labelKey} className="text-zinc-300">
            <span className="text-zinc-400">{t(alt.labelKey)}: </span>
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
        <CaretDown
          {...uiIconProps}
          className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            {t('progress.listRebirthHeading', { n: rebirth })}{' '}
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
          {done ? (
            <SellAfterRebirthList pathId={pathId} afterRebirth={rebirth} compact />
          ) : (
            <SellAfterRebirthList pathId={pathId} afterRebirth={rebirth} />
          )}
        </div>
      ) : null}
    </GlassCard>
  )
}
