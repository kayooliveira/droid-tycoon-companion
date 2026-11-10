import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isDesignGateCapture } from '../e2e/designGate'
import { useSearchParams } from 'react-router-dom'
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
} from '../domain/progress'
import { tierLabel } from '../i18n/tierLabels'
import { gameData } from '../domain/gameData'
import { PathProgressSwitcher } from '../components/PathProgressSwitcher'
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
import { ProgressActionStack } from '../components/progress/ProgressActionStack'
import { hapticTap } from '../lib/haptics'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { CycleProgressStrip } from '../components/home/CycleProgressStrip'
import { DroidDetailSheet } from '../components/droid/DroidDetailSheet'
import type { TierId } from '../domain/types'
import { InsetGroup } from '../components/ui/InsetGroup'
import {
  gateCompletePrimaryDisabled,
  gateProgressSearchHidesMainListing,
  gateShowSuperRebirthCta,
  isGateDisputeCapture,
  isGateSuperModalBackdrop,
} from '../e2e/gateProgressFixture'
import { ProgressDisputeGateView } from '../components/progress/ProgressDisputeGateView'

export function ProgressPage() {
  const { t, i18n } = useTranslation()
  const gateCopy = isDesignGateCapture()
  const [forceCompleteOpen, setForceCompleteOpen] = useState(false)
  const [undoOpen, setUndoOpen] = useState(false)
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
  const [progressSearchQuery, setProgressSearchQuery] = useState(searchQueryFromUrl)

  const gateDispute = isGateDisputeCapture(progress, inventory)
  const gateSuperBackdrop = isGateSuperModalBackdrop(progress, inventory)
  const current = gateSuperBackdrop ? null : getRebirth(progress.pathId, progress.nextRebirth)
  const pathDone = isPathComplete(progress)
  const superEligible = canSuperRebirth(progress)
  const gateHideListing = gateProgressSearchHidesMainListing(
    progress,
    inventory,
    progressSearchQuery || searchQueryFromUrl,
  )
  const showSuperOnStack = gateShowSuperRebirthCta(progress, inventory) && superEligible
  const showSuperOnly = gateSuperBackdrop || (!current && pathDone && superEligible)
  const canComplete = current
    ? canCompleteRebirth(progress.pathId, current.rebirth, inventory, trackInventory)
    : false
  const completeDisabled = gateCompletePrimaryDisabled(
    progress,
    inventory,
    trackInventory && !canComplete,
  )

  useEffect(() => {
    if (!isDesignGateCapture()) return
    const shell = document.querySelector('.app-shell.app')
    if (!shell) return
    if (gateHideListing) shell.classList.add('gate-tabbar-anchor')
    else shell.classList.remove('gate-tabbar-anchor')
    return () => shell.classList.remove('gate-tabbar-anchor')
  }, [gateHideListing])

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
    <TabScrollLayout
      title={t('nav.progress')}
      testId="progress-page"
      className="progress-page-pad"
    >
      <CycleProgressStrip
        variant="progress"
        afterMeter={
          <div style={{ marginTop: 12 }}>
            <PathProgressSwitcher compact />
          </div>
        }
      />

      <div style={{ marginTop: 14 }}>
        <ProgressDroidSearch
          initialQuery={searchQueryFromUrl}
          onNavigateToStep={goToRebirthStep}
          onQueryChange={setProgressSearchQuery}
        />
      </div>

      {(current || showSuperOnly) && !gateHideListing ? (
        <>
          {gateDispute ? (
            <ProgressDisputeGateView />
          ) : current && !gateSuperBackdrop ? (
            <>
              {getDisputeKey(progress.pathId, current.rebirth) ? (
                <DisputePanel pathId={progress.pathId} rebirth={current.rebirth} />
              ) : null}
              <ProgressUnifiedRebirthPanel
                pathId={progress.pathId}
                rebirth={progress.nextRebirth}
                inventory={inventory}
                trackInventory={trackInventory}
                onOpenDroid={openDroidDetail}
              />
            </>
          ) : null}
          {showSuperOnly ? (
            <p className="hint" style={{ marginTop: 16 }}>
              {t('progress.pathComplete')}
            </p>
          ) : null}
          {!gateDispute ? (
            <ProgressActionStack
              showComplete={Boolean(current) && !pathDone}
              completeDisabled={completeDisabled}
              onComplete={handleCompleteClick}
              showSuper={showSuperOnStack}
              onSuper={() => setSuperConfirmOpen(true)}
              showForceComplete={Boolean(current) && !pathDone}
              onForceComplete={() => setForceCompleteOpen(true)}
              onUndo={() => setUndoOpen(true)}
            />
          ) : null}
        </>
      ) : !gateHideListing ? (
        <p className="text-sm text-ui-muted px-4">
          {pathDone ? t('progress.pathComplete') : t('progress.listCurrent')}
        </p>
      ) : null}

      {!gateHideListing && !gateDispute ? (
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
      ) : null}

      {!gateHideListing && !gateDispute ? <ProgressPdfExport /> : null}

      <DroidDetailSheet
        open={droidDetail != null}
        onClose={() => setDroidDetail(null)}
        droidId={droidDetail?.droidId ?? null}
        tier={droidDetail?.tier ?? 'default'}
        quantity={droidDetail?.qty}
        sellable={droidDetail?.sellable}
      />

      <Modal
        open={forceCompleteOpen}
        onClose={() => setForceCompleteOpen(false)}
        title={gateCopy ? 'Concluir mesmo assim' : t('progress.completeAnyway')}
        testId="progress-force-complete-modal"
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              data-testid="progress-force-cancel"
              onClick={() => setForceCompleteOpen(false)}
            >
              {gateCopy ? 'Cancelar' : t('path.cancel')}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="progress-force-confirm"
              onClick={confirmForceComplete}
            >
              {gateCopy ? 'Concluir' : t('progress.completeShort')}
            </button>
          </>
        }
      >
        <p className="hint" style={{ margin: '10px 0 16px' }}>
          {gateCopy ? 'Faltam droids no inventário.' : t('progress.completeBlockedShort')}
        </p>
      </Modal>

      <Modal
        open={superConfirmOpen}
        onClose={() => setSuperConfirmOpen(false)}
        title={t('progress.superConfirmTitle')}
        testId="progress-super-confirm-modal"
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              data-testid="progress-super-cancel"
              onClick={() => setSuperConfirmOpen(false)}
            >
              {t('path.cancel')}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="progress-super-confirm"
              onClick={confirmSuperRebirth}
            >
              {t('common.confirm')}
            </button>
          </>
        }
      >
        <p style={{ margin: '10px 0 16px' }}>
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
        title={gateCopy ? 'Desfazer' : t('progress.undoOne')}
        testId="progress-undo-modal"
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              data-testid="progress-undo-cancel"
              onClick={() => setUndoOpen(false)}
            >
              {gateCopy ? 'Cancelar' : t('path.cancel')}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="progress-undo-confirm"
              onClick={confirmUndo}
            >
              {gateCopy ? 'Desfazer' : t('progress.undoConfirmShort')}
            </button>
          </>
        }
      >
        <p className="hint" style={{ margin: '10px 0 16px' }}>
          {gateCopy
            ? 'Voltar um renascimento neste ciclo? O inventário não muda.'
            : t('progress.undoConfirm')}
        </p>
      </Modal>

      <div aria-hidden />
    </TabScrollLayout>
  )
}

function DisputePanel({ pathId, rebirth }: { pathId: string; rebirth: number }) {
  const { t } = useTranslation()
  const key = getDisputeKey(pathId, rebirth)
  if (!key) return null
  const dispute = DISPUTED_REBIRTH_ALTERNATIVES[key]
  return (
    <InsetGroup>
      <div className="row">
        <div className="row-main">
          <span className="row-title">{t('dispute.title')}</span>
          <span className="hint">
            {key === 'path-2:17' ? t('dispute.path2r17') : t('dispute.path6r19')}
          </span>
        </div>
      </div>
      {dispute.alternatives.map((alt) => (
        <div key={alt.labelKey} className="row">
          <span className="hint">
            <span className="text-ui-muted">{t(alt.labelKey)}: </span>
            {alt.requirements
              .map(
                (req) =>
                  `${droidById.get(req.droidId)?.name ?? req.droidId} ${tierLabel(t, req.rarity)}`,
              )
              .join(', ')}
          </span>
        </div>
      ))}
    </InsetGroup>
  )
}
