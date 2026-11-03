import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowCounterClockwise, DotsThreeVertical } from '@phosphor-icons/react'
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
import { formatTierName } from '../domain/tiers'
import { useTierLabels } from '../i18n/useTierLabels'
import { gameData } from '../domain/gameData'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useAppStore } from '../store/useAppStore'
import { useToast } from '../components/ToastProvider'
import {
  ProgressDroidSearch,
  type ProgressNavTarget,
} from '../components/progress/ProgressDroidSearch'
import { ProgressRebirthList } from '../components/progress/ProgressRebirthList'
import { ProgressUnifiedRebirthPanel } from '../components/progress/ProgressUnifiedRebirthPanel'
import {
  cycleNumberFromPathId,
  pathIdFromCycleNumber,
} from '../domain/progressDroidSearch'
import { ProgressPdfExport } from '../components/ProgressPdfExport'
import { HelpHint } from '../components/ui/HelpHint'
import { IconButton } from '../components/ui/IconButton'
import { hapticTap } from '../lib/haptics'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { DroidDetailSheet } from '../components/droid/DroidDetailSheet'
import type { TierId } from '../domain/types'
import { InsetGroup } from '../components/ui/InsetGroup'

export function ProgressPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const [forceCompleteOpen, setForceCompleteOpen] = useState(false)
  const [undoOpen, setUndoOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [superConfirmOpen, setSuperConfirmOpen] = useState(false)
  const [droidDetail, setDroidDetail] = useState<{
    droidId: string
    tier: TierId
    sellable: boolean
    qty?: number
  } | null>(null)
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const switchPath = useAppStore((s) => s.switchPath)
  const completeRebirthAdvance = useAppStore((s) => s.completeRebirthAdvance)
  const undoRebirthStep = useAppStore((s) => s.undoRebirthStep)
  const superRebirthAdvance = useAppStore((s) => s.superRebirthAdvance)
  const { push } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [navTarget, setNavTarget] = useState<ProgressNavTarget | null>(null)
  const [highlightRebirth, setHighlightRebirth] = useState<number | null>(null)
  const deepLinkHandled = useRef(false)
  const searchQueryFromUrl = searchParams.get('q') ?? ''

  const current = getRebirth(progress.pathId, progress.nextRebirth)
  const canComplete = current
    ? canCompleteRebirth(progress.pathId, current.rebirth, inventory, trackInventory)
    : false

  const advanceWithToast = () => {
    const completedStep = progress.nextRebirth
    completeRebirthAdvance()
    hapticTap()
    push(t('progress.rebirthCompleted', { n: completedStep }), {
      variant: 'success',
      action: {
        label: t('progress.undoConfirmShort'),
        onClick: () => {
          undoRebirthStep()
          push(t('progress.rebirthUndone', { n: completedStep }), { variant: 'success' })
        },
      },
    })
  }

  const cycleLabel = (pathId: string) =>
    formatCycleDisplayName(cycleById.get(pathId)?.name ?? pathId, i18n.language)
  const nextPathId = getNextPathId(progress.pathId)

  const handleCompleteClick = () => {
    if (!current) return
    if (canComplete || !trackInventory) {
      advanceWithToast()
      return
    }
    setForceCompleteOpen(true)
  }

  const confirmForceComplete = () => {
    advanceWithToast()
    setForceCompleteOpen(false)
  }

  const confirmSuperRebirth = () => {
    superRebirthAdvance()
    hapticTap()
    setSuperConfirmOpen(false)
    push(t('path.switched', { name: cycleLabel(nextPathId) }), { variant: 'info' })
  }

  const confirmUndo = () => {
    const undoneStep = Math.max(1, progress.nextRebirth - 1)
    undoRebirthStep()
    setUndoOpen(false)
    push(t('progress.rebirthUndone', { n: undoneStep }), { variant: 'success' })
  }

  const rebirthNumbers = useMemo(
    () =>
      gameData.cycles.find((c) => c.id === progress.pathId)?.rebirths.map((r) => r.rebirth) ?? [],
    [progress.pathId],
  )

  const goToRebirthStep = useCallback(
    (target: ProgressNavTarget) => {
      if (target.pathId !== progress.pathId) {
        switchPath(target.pathId)
      }
      setNavTarget(target)
      setHighlightRebirth(target.rebirth)
      window.setTimeout(() => setHighlightRebirth(null), 2600)
      const next = new URLSearchParams(searchParams)
      next.set('ciclo', String(cycleNumberFromPathId(target.pathId)))
      next.set('passo', String(target.rebirth))
      setSearchParams(next, { replace: false })
    },
    [progress.pathId, searchParams, setSearchParams, switchPath],
  )

  useEffect(() => {
    if (deepLinkHandled.current) return
    const ciclo = Number(searchParams.get('ciclo'))
    const passo = Number(searchParams.get('passo'))
    if (!Number.isFinite(ciclo) || !Number.isFinite(passo) || ciclo < 1 || passo < 1) return
    deepLinkHandled.current = true
    const pathId = pathIdFromCycleNumber(ciclo)
    goToRebirthStep({ pathId, rebirth: passo })
  }, [goToRebirthStep, searchParams])

  const openDroidDetail = (droidId: string, tier: TierId, sellable: boolean, qty?: number) => {
    setDroidDetail({ droidId, tier, sellable, qty })
  }

  return (
    <TabScrollLayout title={t('nav.progress')} testId="progress-page">
      <InsetGroup footer={t('progress.workingOn', { n: progress.nextRebirth })}>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{cycleLabel(progress.pathId)}</span>
            <span className="dc-row-sub">
              <PathProgressSwitcher compact />
            </span>
          </div>
        </div>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('progress.pathProgress')}</span>
            <span className="dc-row-sub">
              <ProgressSummaryLine />
            </span>
          </div>
        </div>
      </InsetGroup>

      <ProgressDroidSearch initialQuery={searchQueryFromUrl} onNavigateToStep={goToRebirthStep} />

      {current ? (
        <>
          {getDisputeKey(progress.pathId, current.rebirth) ? (
            <DisputePanel
              pathId={progress.pathId}
              rebirth={current.rebirth}
              tierLabels={tierLabels}
            />
          ) : null}
          <ProgressUnifiedRebirthPanel
            pathId={progress.pathId}
            rebirth={progress.nextRebirth}
            inventory={inventory}
            trackInventory={trackInventory}
            onOpenDroid={openDroidDetail}
          />
          {canSuperRebirth(progress) ? (
            <div className="flex flex-col gap-2 px-4 w-full min-w-0" data-testid="progress-super-actions">
              <Button
                variant="accent"
                className="w-full min-h-12"
                data-testid="progress-super-cta"
                onClick={() => setSuperConfirmOpen(true)}
              >
                {t('progress.superRebirthCta')}
              </Button>
              <div className="flex items-center gap-2 w-full min-w-0">
                {!isPathComplete(progress) ? (
                  <Button
                    onClick={handleCompleteClick}
                    disabled={trackInventory && !canComplete}
                    className="flex-1 min-w-0"
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
                  <DotsThreeVertical {...uiIconProps} />
                </IconButton>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 w-full min-w-0">
              <Button
                className="btn-wide !mx-0 flex-1"
                onClick={handleCompleteClick}
                disabled={trackInventory && !canComplete}
                data-testid="progress-complete-main"
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
                <DotsThreeVertical {...uiIconProps} />
              </IconButton>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-ui-muted px-4">
          {isPathComplete(progress) ? t('progress.pathComplete') : t('progress.listCurrent')}
        </p>
      )}

      <ProgressRebirthList
        pathId={progress.pathId}
        rebirthNumbers={rebirthNumbers}
        nextRebirth={progress.nextRebirth}
        inventory={inventory}
        trackInventory={trackInventory}
        navTarget={navTarget}
        highlightRebirth={highlightRebirth}
        onNavHandled={() => setNavTarget(null)}
      />

      <ProgressPdfExport />

      <DroidDetailSheet
        open={droidDetail != null}
        onClose={() => setDroidDetail(null)}
        droidId={droidDetail?.droidId ?? null}
        tier={droidDetail?.tier ?? 'default'}
        quantity={droidDetail?.qty}
        sellable={droidDetail?.sellable}
      />

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
        <p className="text-xs text-ui-muted text-pretty">{t('progress.completeBlockedShort')}</p>
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
        <p className="text-sm text-ui-secondary text-pretty">
          {t('progress.superConfirmBody', {
            currentCycle: cycleLabel(progress.pathId),
            nextCycle: cycleLabel(nextPathId),
            currentStep: progress.nextRebirth,
          })}
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
        <p className="text-xs text-ui-muted text-pretty">{t('progress.undoConfirm')}</p>
      </Modal>

      <div className="dc-scroll-spacer" aria-hidden />
    </TabScrollLayout>
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
    <InsetGroup>
      <div className="dc-row">
        <div className="dc-row-main">
          <span className="dc-row-label">{t('dispute.title')}</span>
          <span className="dc-row-sub">
            {key === 'path-2:17' ? t('dispute.path2r17') : t('dispute.path6r19')}
          </span>
        </div>
      </div>
      {dispute.alternatives.map((alt) => (
        <div key={alt.labelKey} className="dc-row">
          <span className="dc-row-sub">
            <span className="text-ui-muted">{t(alt.labelKey)}: </span>
            {alt.requirements
              .map(
                (req) =>
                  `${droidById.get(req.droidId)?.name ?? req.droidId} ${formatTierName(req.rarity, tierLabels)}`,
              )
              .join(', ')}
          </span>
        </div>
      ))}
    </InsetGroup>
  )
}
