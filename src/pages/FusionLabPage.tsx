import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import type { FusionRecipe } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore } from '../store/useAppStore'

function fusionRuleText(rule: (typeof gameData.fusionRules)[0]): string {
  return rule.description ?? rule.summary ?? rule.text ?? ''
}

export function FusionLabPage() {
  const { t } = useTranslation()
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
  const resultTierNote = gameData.fusions.find((f) => f.resultTierRule)?.resultTierRule

  return (
    <div className="space-y-6">
      <div>
        <h1 className="hidden md:block font-display text-2xl tracking-wide">{t('fusion.title')}</h1>
        <Badge tone="warn" className="mt-2">
          {t('fusion.partialBadge')}
        </Badge>
      </div>

      <GlassCard className="space-y-3 text-sm">
        <p className="font-medium text-zinc-100">{t('fusion.rulesTitle')}</p>
        <ul className="space-y-3">
          {gameData.fusionRules.map((rule) => (
            <li key={rule.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <p className="text-zinc-300">{fusionRuleText(rule)}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge tone={rule.confidence === 'confirmed' ? 'success' : 'warn'}>
                  {t(`confidence.${rule.confidence ?? 'partial'}`)}
                </Badge>
                {rule.sourceUrl ? (
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-holo-300 hover:underline"
                  >
                    Source
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {resultTierNote ? (
          <p className="text-xs text-zinc-400 border-t border-white/10 pt-3">{resultTierNote}</p>
        ) : null}
        <p className="text-xs text-zinc-500">{t('fusion.rulesFootnote')}</p>
      </GlassCard>

      {helpful.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-display text-lg">{t('fusion.helpsNext')}</h2>
          {helpful.map((f) => (
            <RecipeCard key={f.id} fusion={f} />
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          <h2 className="font-display text-lg">{t('fusion.recipes')}</h2>
          <input
            className="ml-auto rounded-lg bg-surface-800 border border-white/10 px-3 py-1.5 text-sm min-w-[8rem]"
            placeholder={t('fusion.search')}
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
  const { t } = useTranslation()
  const result = droidById.get(fusion.resultDroidId)
  return (
    <GlassCard className="py-3 px-4">
      <div className="flex items-center gap-3 flex-wrap">
        {result ? <DroidImage droid={result} size="sm" /> : null}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">{result?.name ?? fusion.resultDroidId}</p>
        </div>
        <Badge tone="warn" className="shrink-0">
          {t(`confidence.${fusion.confidence ?? 'partial'}`)}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
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
