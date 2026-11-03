import { useTranslation } from 'react-i18next'
import { gameData } from '../../domain/gameData'
import { formatCycleDisplayName } from '../../lib/cycleLabel'
import { useAppStore } from '../../store/useAppStore'

export function CycleProgressStrip() {
  const { t, i18n } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const cycle = gameData.cycles.find((c) => c.id === progress.pathId)
  const total = cycle?.rebirths.length ?? 40
  const done = progress.completedOnPath
  const pct = total > 0 ? done / total : 0
  const circumference = 2 * Math.PI * 16
  const dash = `${(pct * circumference).toFixed(2)} ${circumference.toFixed(2)}`

  return (
    <div className="cycle-strip" data-testid="home-cycle-strip">
      <div className="cycle-ring" aria-hidden>
        <svg viewBox="0 0 40 40">
          <circle className="ring-track" cx="20" cy="20" r="16" />
          <circle className="ring-fill" cx="20" cy="20" r="16" strokeDasharray={dash} />
        </svg>
        <span className="ring-label">
          {done}/{total}
        </span>
      </div>
      <div className="cycle-strip-text">
        <span className="cycle-strip-title">
          {cycle ? formatCycleDisplayName(cycle.name, i18n.language) : progress.pathId}
        </span>
        <span className="cycle-strip-sub">
          {t('home.nextRenascimento', { n: progress.nextRebirth })}
        </span>
      </div>
    </div>
  )
}
