import { cycleById, gameData, getRebirth } from '../domain/gameData'
import { pathProgressPercent, REBIRTHS_PER_PATH } from '../domain/progress'
import { evaluateRequirements, metRequirementCount } from '../domain/requirements'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { isDataStale } from '../domain/gameData'
import { RequirementCard } from '../components/RequirementCard'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAppStore } from '../store/useAppStore'

export function DashboardPage() {
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const cycle = cycleById.get(progress.pathId)
  const next = getRebirth(progress.pathId, progress.nextRebirth)
  const checks = next
    ? evaluateRequirements(next.requirements, inventory, trackInventory)
    : []
  const sell = summarizeSellCenter(
    analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Dashboard</p>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">
            {cycle?.name ?? progress.pathId}
          </h1>
        </div>
        {isDataStale() ? (
          <Badge tone="warn">Game data may be stale — check Settings</Badge>
        ) : (
          <Badge tone="info">Data v{gameData.dataVersion}</Badge>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-xs text-zinc-500">Current rebirth</p>
          <p className="font-display text-3xl mt-1">
            {Math.min(progress.nextRebirth, REBIRTHS_PER_PATH)}
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            {progress.completedOnPath} completed on path
          </p>
        </GlassCard>
        <GlassCard className="md:col-span-2">
          <ProgressBar
            label="Path progress"
            value={pathProgressPercent(progress)}
          />
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg tracking-wide text-gradient-holo">Next Rebirth</h2>
          {next ? (
            <Badge tone={next.confidence === 'confirmed' ? 'success' : 'warn'}>
              {next.confidence === 'confirmed' ? 'Verified' : 'Unconfirmed'}
            </Badge>
          ) : null}
        </div>
        {next ? (
          <>
            <p className="text-sm text-zinc-400">
              Rebirth {next.rebirth} · Credits {next.credits}
              {next.unlocks ? ` · Unlocks ${next.unlocks}` : ''}
            </p>
            {next.note ? (
              <p className="text-xs text-amber-200/90 border border-amber-400/20 rounded-lg p-2">
                {next.note}
              </p>
            ) : null}
            <div className="space-y-2">
              {checks.map((c) => (
                <RequirementCard key={c.requirement.droidId} check={c} />
              ))}
            </div>
            {trackInventory ? (
              <ProgressBar
                label="Requirements ready"
                value={(metRequirementCount(checks) / 3) * 100}
              />
            ) : null}
          </>
        ) : (
          <p className="text-sm text-zinc-400">Path complete — consider Super Rebirth in Progress.</p>
        )}
      </GlassCard>

      {trackInventory ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard>
            <p className="text-xs text-zinc-500">Required (next)</p>
            <p className="text-2xl font-semibold">3</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-zinc-500">Ready</p>
            <p className="text-2xl font-semibold text-emerald-300">{metRequirementCount(checks)}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-zinc-500">Keep (path)</p>
            <p className="text-2xl font-semibold">{sell.keep}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-zinc-500">Sellable</p>
            <p className="text-2xl font-semibold text-holo-300">{sell.sellable}</p>
          </GlassCard>
        </div>
      ) : null}
    </div>
  )
}
