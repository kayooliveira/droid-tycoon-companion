import { useMemo, useState } from 'react'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import type { FusionRecipe } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore } from '../store/useAppStore'

export function FusionLabPage() {
  const [search, setSearch] = useState('')
  const progress = useAppStore((s) => s.progress)
  const next = getRebirth(progress.pathId, progress.nextRebirth)
  const upcomingIds = new Set(next?.requirements.map((r) => r.droidId) ?? [])

  const recipes = useMemo(() => {
    return gameData.fusions.filter((f) => {
      const d = droidById.get(f.resultDroidId)
      if (search) {
        const q = search.toLowerCase()
        if (!d?.name.toLowerCase().includes(q) && !f.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [search])

  const helpful = recipes.filter((f) => upcomingIds.has(f.resultDroidId))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide">Fusion Lab</h1>
        <Badge tone="warn" className="mt-2">
          Partial / single-source data — verify in game
        </Badge>
      </div>

      <GlassCard className="space-y-2 text-sm text-zinc-300">
        <p className="font-medium text-zinc-100">General rules</p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          {gameData.fusionRules.map((rule, i) => (
            <li key={i}>{rule.summary ?? rule.text ?? JSON.stringify(rule)}</li>
          ))}
        </ul>
        <p className="text-xs text-zinc-500">
          Fusion unlocks at rebirth 3. No fusion-only droid is required for rebirths per source notes.
        </p>
      </GlassCard>

      {helpful.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-display text-lg">Helps upcoming rebirth</h2>
          {helpful.map((f) => (
            <RecipeCard key={f.id} fusion={f} />
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex gap-2 items-center">
          <h2 className="font-display text-lg">Recipes</h2>
          <input
            className="ml-auto rounded-lg bg-surface-800 border border-white/10 px-3 py-1.5 text-sm"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {recipes.map((f) => (
          <RecipeCard key={f.id} fusion={f} />
        ))}
      </section>
    </div>
  )
}

function RecipeCard({ fusion }: { fusion: FusionRecipe }) {
  const result = droidById.get(fusion.resultDroidId)
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center gap-3">
        {result ? <DroidImage droid={result} size="sm" /> : null}
        <div>
          <p className="font-medium">{result?.name ?? fusion.resultDroidId}</p>
          <p className="text-xs text-zinc-500">{fusion.resultTierRule}</p>
        </div>
        <Badge tone="warn" className="ml-auto">
          {fusion.confidence ?? 'partial'}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {fusion.ingredients.map((ing) => {
          const d = droidById.get(ing.droidId)
          return (
            <span
              key={ing.droidId}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-xs"
            >
              {d ? <DroidImage droid={d} size="sm" className="!h-8 !w-8" /> : null}
              {d?.name ?? ing.droidId} ×{ing.quantity}
            </span>
          )
        })}
      </div>
    </GlassCard>
  )
}
