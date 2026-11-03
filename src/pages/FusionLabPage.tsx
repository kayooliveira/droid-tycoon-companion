import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import type { FusionRecipe } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { droidMatchesQuery } from '../lib/droidNameMatch'
import { useAppStore } from '../store/useAppStore'
import { PageScreen } from '../components/layout/PageScreen'
import { ScreenHero } from '../components/layout/ScreenHero'
const FUSION_RULE_KEY: Record<string, string> = {
  'tier-up': 'fusion.rules.tierUp',
  random: 'fusion.rules.random',
  unlock: 'fusion.rules.unlock',
}

function fusionRuleKey(rule: (typeof gameData.fusionRules)[0]): string {
  return FUSION_RULE_KEY[rule.id] ?? ''
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
        if (!droidMatchesQuery(search, d?.name ?? '', f.resultDroidId) && !f.id.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
      }
      return true
    })
  }, [search])

  const helpful = recipes.filter((f) => upcomingIds.has(f.resultDroidId))
  const showResultTierRule = gameData.fusions.some((f) => f.resultTierRule)

  return (
    <PageScreen testId="fusion-page" className="space-y-6">
      <ScreenHero
        title={t('fusion.title')}
        kicker={t('nav.fusion')}
        action={<Badge tone="warn">{t('fusion.partialBadge')}</Badge>}
      />

      <GlassCard className="space-y-3 text-sm" data-testid="fusion-rules-card">
        <p className="font-medium text-ui-fg">{t('fusion.rulesTitle')}</p>
        <ul className="space-y-3">
          {gameData.fusionRules.map((rule) => {
            const key = fusionRuleKey(rule)
            const text = key ? t(key) : (rule.description ?? rule.summary ?? rule.text ?? '')
            return (
              <li key={rule.id} className="border-b border-ui-subtle pb-3 last:border-0 last:pb-0">
                <p className="text-ui-secondary">{text}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge tone={rule.confidence === 'confirmed' ? 'success' : 'warn'}>
                    {t(`confidence.${rule.confidence ?? 'partial'}`)}
                  </Badge>
                  {rule.sourceUrl ? (
                    <a
                      href={rule.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-ui-accent hover:underline"
                    >
                      {t('fusion.sourceLink')}
                    </a>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
        {showResultTierRule ? (
          <p className="text-xs text-ui-muted border-t border-ui pt-3">{t('fusion.resultTierRule')}</p>
        ) : null}
        <p className="text-xs text-ui-soft">{t('fusion.rulesFootnote')}</p>
      </GlassCard>

      <section className="space-y-2">
        <h2 className="font-display text-lg">{t('fusion.helpsNext')}</h2>
        {helpful.length > 0 ? (
          helpful.map((f) => <RecipeCard key={f.id} fusion={f} />)
        ) : (
          <GlassCard className="text-sm text-ui-muted py-4 px-4">{t('fusion.helpsNextEmpty')}</GlassCard>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          <h2 className="font-display text-lg">{t('fusion.recipes')}</h2>
          <input
            className="ml-auto rounded-lg bg-ui-field border border-ui px-3 py-1.5 text-base min-w-[8rem] min-h-11"
            placeholder={t('fusion.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('fusion.search')}
          />
        </div>
        {recipes.length === 0 ? (
          <GlassCard className="text-sm text-ui-muted py-6 px-4 text-center">{t('fusion.emptySearch')}</GlassCard>
        ) : (
          recipes.map((f) => <RecipeCard key={f.id} fusion={f} />)
        )}
      </section>
    </PageScreen>
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
              className="inline-flex items-center gap-2 rounded-lg bg-ui-hover px-2 py-1 text-xs"
            >
              {d ? <DroidImage droid={d} size="sm" className="!h-8 !w-8" /> : null}
              {d?.name ?? ing.droidId} {t('common.quantity', { n: ing.quantity })}
            </span>
          )
        })}
      </div>
    </GlassCard>
  )
}
