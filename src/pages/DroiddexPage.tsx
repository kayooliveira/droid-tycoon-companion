import { useMemo, useState } from 'react'
import { gameData } from '../domain/gameData'
import { buildTierLabelMap, formatTierName } from '../domain/tiers'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import type { Droid } from '../domain/types'

const tierLabels = buildTierLabelMap(gameData.rarities)

export function DroiddexPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Droid | null>(null)
  const [classFilter, setClassFilter] = useState<string>('all')

  const droids = useMemo(() => {
    return gameData.droids
      .filter((d) => {
        if (classFilter !== 'all' && d.class !== classFilter) return false
        if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [search, classFilter])

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl tracking-wide">Droiddex</h1>
      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 min-w-[200px] rounded-xl bg-surface-800 border border-white/10 px-4 py-2 text-sm"
          placeholder="Search droids…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl bg-surface-800 border border-white/10 px-3 py-2 text-sm"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="all">All classes</option>
          {['Worker', 'Astromech', 'Battle', 'Protocol'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {droids.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d)}
            className="glass-panel rounded-2xl p-3 text-left hover:bg-white/10 transition-colors"
          >
            <DroidImage droid={d} className="mx-auto mb-2" />
            <p className="text-sm font-medium truncate">{d.name}</p>
            <p className="text-[10px] text-zinc-500">{d.baseRarity}</p>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Droid'}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <DroidImage droid={selected} size="lg" />
              <div className="space-y-2 text-sm">
                <Badge>{selected.class}</Badge>
                <Badge tone="info">{selected.baseRarity}</Badge>
                {selected.fusionOnly ? <Badge tone="warn">Fusion only</Badge> : null}
                <Badge tone={selected.confidence === 'confirmed' ? 'success' : 'warn'}>
                  {selected.confidence}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Tiers</p>
              <p className="text-sm">
                {selected.tiersAvailable.map((t) => formatTierName(t, tierLabels)).join(' · ')}
              </p>
            </div>
            {selected.requiredIn?.length ? (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Required in rebirths</p>
                <ul className="text-xs space-y-1 max-h-40 overflow-auto">
                  {selected.requiredIn.slice(0, 12).map((r) => (
                    <li key={`${r.cycle}-${r.rebirth}-${r.rarity}`}>
                      {r.cycle} R{r.rebirth} · {formatTierName(r.rarity, tierLabels)}
                    </li>
                  ))}
                  {(selected.requiredIn.length ?? 0) > 12 ? (
                    <li className="text-zinc-500">+ {selected.requiredIn.length - 12} more</li>
                  ) : null}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Not required in tracked rebirth data.</p>
            )}
            <a
              href={selected.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-holo-300 hover:underline"
            >
              Source (last verified {selected.lastVerified})
            </a>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
