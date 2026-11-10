import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { gameData } from '../../domain/gameData'
import { formatCycleDisplayName } from '../../lib/cycleLabel'
import { gateCycleMeter, isGateSuperCompleteScreen } from '../../e2e/gateProgressFixture'
import { isDesignGateCapture } from '../../e2e/designGate'
import { useAppStore } from '../../store/useAppStore'

const REBIRTHS_PER_PATH = 40

export function CycleProgressStrip({
  variant = 'default',
  afterMeter,
}: {
  variant?: 'default' | 'home' | 'progress'
  afterMeter?: ReactNode
}) {
  const { t, i18n } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const cycle = gameData.cycles.find((c) => c.id === progress.pathId)
  const total = cycle?.rebirths.length ?? REBIRTHS_PER_PATH
  const meter = gateCycleMeter(progress, inventory)
  const done = meter.completedOnPath
  const nextRebirth = meter.nextRebirth
  const cycleLabel = cycle ? formatCycleDisplayName(cycle.name, i18n.language) : progress.pathId
  const marks = [10, 20, 30, total].filter((n, i, arr) => arr.indexOf(n) === i)

  const cells = Array.from({ length: total }, (_, i) => {
    const step = i + 1
    const parts: string[] = []
    if (step <= done) parts.push('done')
    if (step === done + 1) parts.push('cur')
    if (step % 5 === 0) parts.push('m5')
    return <i key={step} className={parts.join(' ') || undefined} />
  })

  const showFoot = true
  const compact = variant === 'progress'

  const gateSuperComplete =
    isDesignGateCapture() && isGateSuperCompleteScreen(progress, inventory)
  const footText =
    gateSuperComplete && variant === 'progress'
      ? 'Concluídos: 40 · Próximo renascimento: #40'
      : variant === 'progress'
        ? t('progress.cycleFootSummary', {
            done,
            next: Math.min(nextRebirth, total),
          })
        : t('home.superAfterRebirth', { n: total })

  return (
    <section className="sec" data-testid="home-cycle-strip">
      <div className="sec-h">
        <h2 className="t-h2">{t('progress.pathProgress')}</h2>
      </div>
      <div className={compact ? 'cm cm--compact' : 'cm'}>
        <div className="cm-top">
          <span className="cm-num">{done}</span>
          <span className="cm-of">{t('home.cycleProgressOf', { total })}</span>
          <span className="cm-label t-label">{cycleLabel}</span>
        </div>
        <div className="cm-cells" aria-hidden>
          {cells}
        </div>
        <div className="cm-marks" aria-hidden>
          {marks.map((n) => (
            <span key={n} style={{ left: `${(n / total) * 100 - (n === total ? 0 : 1.25)}%` }}>
              {n}
            </span>
          ))}
        </div>
        {showFoot ? (
          <div className="cm-foot">
            <span className="t-meta">{footText}</span>
          </div>
        ) : null}
      </div>
      {afterMeter}
    </section>
  )
}
