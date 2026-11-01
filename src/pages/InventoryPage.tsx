import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { droidById, gameData } from '../domain/gameData'
import { droidHasFutureNeedOnPath } from '../domain/sellCenter'
import { buildTierLabelMap, formatTierName } from '../domain/tiers'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { Modal } from '../components/ui/Modal'
import { useAppStore } from '../store/useAppStore'
import type { TierId } from '../domain/types'

const tierLabels = buildTierLabelMap(gameData.rarities)

export function InventoryPage() {
  const inventory = useAppStore((s) => s.inventory)
  const progress = useAppStore((s) => s.progress)
  const addInventoryUnit = useAppStore((s) => s.addInventoryUnit)
  const updateInventoryUnit = useAppStore((s) => s.updateInventoryUnit)
  const removeInventoryUnit = useAppStore((s) => s.removeInventoryUnit)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)

  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [neededFilter, setNeededFilter] = useState<'all' | 'needed' | 'not-needed'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [newDroidId, setNewDroidId] = useState(gameData.droids[0]?.id ?? '')
  const [newTier, setNewTier] = useState<TierId>('default')

  const filtered = useMemo(() => {
    return inventory
      .filter((u) => {
        const d = droidById.get(u.droidId)
        if (search && !d?.name.toLowerCase().includes(search.toLowerCase())) return false
        if (rarityFilter !== 'all' && d?.baseRarity.toLowerCase() !== rarityFilter) return false
        if (tierFilter !== 'all' && u.tier !== tierFilter) return false
        const needed = droidHasFutureNeedOnPath(progress.pathId, progress.nextRebirth, u.droidId)
        if (neededFilter === 'needed' && !needed) return false
        if (neededFilter === 'not-needed' && needed) return false
        return true
      })
      .sort((a, b) => (droidById.get(a.droidId)?.name ?? '').localeCompare(droidById.get(b.droidId)?.name ?? ''))
  }, [inventory, search, rarityFilter, tierFilter, neededFilter, progress.pathId, progress.nextRebirth])

  if (!trackInventory) {
    return (
      <GlassCard>
        <h1 className="font-display text-xl mb-2">Inventory tracking off</h1>
        <p className="text-sm text-zinc-400">
          Enable inventory tracking in Settings to manage owned droids.
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide">Inventory</h1>
        <Button onClick={() => setAddOpen(true)}>Add droid</Button>
      </div>
      <input
        className="w-full rounded-xl bg-surface-800 border border-white/10 px-4 py-2.5 text-sm"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2 text-sm"
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
        >
          <option value="all">All rarities</option>
          {gameData.baseRarities.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2 text-sm"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="all">All tiers</option>
          {gameData.rarities.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2 text-sm"
          value={neededFilter}
          onChange={(e) => setNeededFilter(e.target.value as typeof neededFilter)}
        >
          <option value="all">All needs</option>
          <option value="needed">Needed on path</option>
          <option value="not-needed">Not needed</option>
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map((unit) => {
          const droid = droidById.get(unit.droidId)
          if (!droid) return null
          const needed = droidHasFutureNeedOnPath(progress.pathId, progress.nextRebirth, unit.droidId)
          return (
            <GlassCard key={unit.id} className="flex gap-3 items-center">
              <DroidImage droid={droid} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{droid.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge>{droid.baseRarity}</Badge>
                  <Badge tone="info">{formatTierName(unit.tier, tierLabels)}</Badge>
                  <Badge tone={needed ? 'warn' : 'success'}>
                    {needed ? 'Needed later' : 'Not needed on path'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  className="w-16 rounded-lg bg-surface-800 border border-white/10 px-2 py-1 text-sm"
                  value={unit.quantity}
                  onChange={(e) =>
                    updateInventoryUnit(unit.id, { quantity: Math.max(1, Number(e.target.value)) })
                  }
                />
                <Button variant="ghost" aria-label="Remove" onClick={() => removeInventoryUnit(unit.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </GlassCard>
          )
        })}
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">No droids yet — add your first unit.</p>
        ) : null}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add droid">
        <div className="space-y-3">
          <label className="block text-sm">
            Droid
            <select
              className="mt-1 w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2"
              value={newDroidId}
              onChange={(e) => setNewDroidId(e.target.value)}
            >
              {gameData.droids.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Tier
            <select
              className="mt-1 w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2"
              value={newTier}
              onChange={(e) => setNewTier(e.target.value as TierId)}
            >
              {gameData.rarities.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            className="w-full"
            onClick={() => {
              addInventoryUnit(newDroidId, newTier, 1)
              setAddOpen(false)
            }}
          >
            Add to inventory
          </Button>
        </div>
      </Modal>
    </div>
  )
}
