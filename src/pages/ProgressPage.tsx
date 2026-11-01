import { motion } from 'motion/react'
import { useState } from 'react'
import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react'
import {
  cycleById,
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
import { RequirementCard } from '../components/RequirementCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAppStore } from '../store/useAppStore'
import { useToast } from '../components/ToastProvider'

const tierLabels = buildTierLabelMap(gameData.rarities)

export function ProgressPage() {
  const [mode, setMode] = useState<'list' | 'focus'>('focus')
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const completeRebirthAdvance = useAppStore((s) => s.completeRebirthAdvance)
  const undoRebirthStep = useAppStore((s) => s.undoRebirthStep)
  const superRebirthAdvance = useAppStore((s) => s.superRebirthAdvance)
  const animations = useAppStore((s) => s.settings.animationsEnabled)
  const { push } = useToast()

  const cycle = cycleById.get(progress.pathId)
  const current = getRebirth(progress.pathId, progress.nextRebirth)

  const handleComplete = () => {
    if (!current) return
    if (!canCompleteRebirth(progress.pathId, current.rebirth, inventory, trackInventory)) {
      push('Requirements not met — update inventory or disable tracking in Settings.')
      return
    }
    completeRebirthAdvance()
    push(`Rebirth ${current.rebirth} complete!`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide">Progress</h1>
          <p className="text-sm text-zinc-400">{cycle?.name}</p>
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
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'focus' ? (
        <GlassCard className="space-y-4">
          {current ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg">
                  Rebirth {current.rebirth} → {current.rebirth + 1}
                </h2>
                <Badge tone={current.confidence === 'confirmed' ? 'success' : 'warn'}>
                  {current.confidence}
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
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={handleComplete}>Complete rebirth</Button>
                <Button variant="secondary" onClick={undoRebirthStep}>
                  <RotateCcw size={16} /> Undo one level
                </Button>
              </div>
              {canSuperRebirth(progress) ? (
                <Button variant="secondary" onClick={() => superRebirthAdvance()}>
                  <Sparkles size={16} /> Super Rebirth → next path
                </Button>
              ) : (
                <p className="text-xs text-zinc-500">
                  Super Rebirth unlocks after {SUPER_REBIRTH_UNLOCK_AFTER} completed rebirths.
                </p>
              )}
              {animations ? (
                <motion.div
                  layout
                  className="h-1 rounded-full bg-gradient-to-r from-holo-600 to-accent-cyan"
                />
              ) : null}
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              {isPathComplete(progress)
                ? 'Path complete! Use Super Rebirth to continue.'
                : 'No rebirth data.'}
            </p>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {cycle?.rebirths.map((r) => (
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
    </div>
  )
}

function DisputePanel({ pathId, rebirth }: { pathId: string; rebirth: number }) {
  const key = getDisputeKey(pathId, rebirth)
  if (!key) return null
  const dispute = DISPUTED_REBIRTH_ALTERNATIVES[key]
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-3 text-xs space-y-2">
      <p className="text-amber-100 font-medium">Unconfirmed requirements</p>
      <p className="text-amber-200/80">{dispute.note}</p>
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
  const [open, setOpen] = useState(active)
  const entry = getRebirth(pathId, rebirth)
  if (!entry) return null
  const checks = evaluateRequirements(entry.requirements, inventory, trackInventory)
  const done = rebirth < nextRebirth

  return (
    <GlassCard className={active ? 'ring-1 ring-holo-400/40' : ''}>
      <button
        type="button"
        className="w-full flex items-center gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
        <div className="flex-1">
          <p className="font-medium">
            Rebirth {rebirth}{' '}
            {done ? <Badge tone="success">Done</Badge> : null}
            {active ? <Badge tone="info">Current</Badge> : null}
          </p>
          <p className="text-xs text-zinc-500">{entry.credits} credits</p>
        </div>
        {trackInventory ? (
          <span className="text-xs text-zinc-400">
            {metRequirementCount(checks)}/3 ready
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {entry.note ? <p className="text-xs text-amber-200/90">{entry.note}</p> : null}
          {checks.map((c) => (
            <RequirementCard key={c.requirement.droidId} check={c} />
          ))}
          <ProgressBar value={(metRequirementCount(checks) / 3) * 100} />
        </div>
      ) : null}
    </GlassCard>
  )
}
