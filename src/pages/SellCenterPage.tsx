import { analyzeSellCenter } from '../domain/sellCenter'
import { droidById } from '../domain/gameData'
import { buildTierLabelMap, formatTierName } from '../domain/tiers'
import { gameData } from '../domain/gameData'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore } from '../store/useAppStore'

const tierLabels = buildTierLabelMap(gameData.rarities)

export function SellCenterPage() {
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const items = analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory)

  const groups = {
    keep: items.filter((i) => i.category === 'keep'),
    sellable: items.filter((i) => i.category === 'sellable'),
    upgrade: items.filter((i) => i.category === 'upgrade'),
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl tracking-wide">Sell Center</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
          Analyzes rebirths {progress.nextRebirth}–40 on{' '}
          <span className="text-zinc-200">{progress.pathId}</span> only. After Super Rebirth, future
          paths reset most droids — plan ahead manually for later paths.
        </p>
      </div>

      {(['keep', 'upgrade', 'sellable'] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="font-display text-lg capitalize">{cat}</h2>
          {groups[cat].length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing in this category.</p>
          ) : (
            groups[cat].map((item, idx) => {
              const droid = droidById.get(item.droidId)
              if (!droid) return null
              return (
                <GlassCard key={`${item.unitId}-${idx}`} className="flex gap-3">
                  <DroidImage droid={droid} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-medium">{droid.name}</p>
                      <Badge tone="info">{formatTierName(item.tier, tierLabels)}</Badge>
                      <Badge>×{item.quantity}</Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{item.reason}</p>
                  </div>
                </GlassCard>
              )
            })
          )}
        </section>
      ))}
    </div>
  )
}
