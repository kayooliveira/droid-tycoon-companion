import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById, gameData, getRebirth } from '../domain/gameData'
import type { FusionRecipe } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { showcaseTierForDroid } from '../components/ui/tierVisuals'
import { Badge } from '../components/ui/Badge'
import { droidMatchesQuery } from '../lib/droidNameMatch'
import { useAppStore } from '../store/useAppStore'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { InsetGroup } from '../components/ui/InsetGroup'
import { SearchInput } from '../components/ui/SearchInput'

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
        if (
          !droidMatchesQuery(search, d?.name ?? '', f.resultDroidId) &&
          !f.id.toLowerCase().includes(search.toLowerCase())
        ) {
          return false
        }
      }
      return true
    })
  }, [search])

  const helpful = recipes.filter((f) => upcomingIds.has(f.resultDroidId))
  const showResultTierRule = gameData.fusions.some((f) => f.resultTierRule)

  return (
    <TabScrollLayout title={t('fusion.title')} testId="fusion-page">
      <section className="dc-section">
        <h2 className="dc-section-header">{t('fusion.rulesTitle')}</h2>
        <InsetGroup testId="fusion-rules-card" footer={t('fusion.rulesFootnote')}>
        {gameData.fusionRules.map((rule) => {
          const key = fusionRuleKey(rule)
          const text = key ? t(key) : (rule.description ?? rule.summary ?? rule.text ?? '')
          return (
            <div key={rule.id} className="dc-row">
              <div className="dc-row-main">
                <span className="dc-row-label">{text}</span>
                <span className="dc-row-sub">{t(`confidence.${rule.confidence ?? 'partial'}`)}</span>
              </div>
            </div>
          )
        })}
        {showResultTierRule ? (
          <div className="dc-row">
            <div className="dc-row-main">
              <span className="dc-row-sub">{t('fusion.resultTierRule')}</span>
            </div>
          </div>
        ) : null}
        </InsetGroup>
      </section>

      <section className="dc-section">
        <h2 className="dc-section-header">{t('fusion.helpsNext')}</h2>
        {helpful.length > 0 ? (
          helpful.map((f) => <RecipeCard key={f.id} fusion={f} />)
        ) : (
          <InsetGroup>
            <div className="dc-row">
              <div className="dc-row-main">
                <span className="dc-row-sub">{t('fusion.helpsNextEmpty')}</span>
              </div>
            </div>
          </InsetGroup>
        )}
      </section>

      <section className="dc-section">
        <h2 className="dc-section-header">{t('fusion.recipes')}</h2>
        <div className="dc-search-wrap !px-0">
          <SearchInput
            placeholder={t('fusion.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('fusion.search')}
          />
        </div>
        {recipes.length === 0 ? (
          <InsetGroup>
            <div className="dc-row">
              <div className="dc-row-main">
                <span className="dc-row-sub">{t('fusion.emptySearch')}</span>
              </div>
            </div>
          </InsetGroup>
        ) : (
          recipes.map((f) => <RecipeCard key={f.id} fusion={f} />)
        )}
      </section>
    </TabScrollLayout>
  )
}

function RecipeCard({ fusion }: { fusion: FusionRecipe }) {
  const { t } = useTranslation()
  const result = droidById.get(fusion.resultDroidId)
  return (
    <InsetGroup>
      <div className="dc-row dc-row-droid">
        {result ? (
          <DroidImage droid={result} tier={showcaseTierForDroid(result)} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
        ) : null}
        <div className="dc-row-main">
          <span className="dc-droid-name dc-row-label">{result?.name ?? fusion.resultDroidId}</span>
          <span className="dc-row-sub">
            <Badge tone="warn">{t(`confidence.${fusion.confidence ?? 'partial'}`)}</Badge>
          </span>
        </div>
      </div>
      {fusion.ingredients.map((ing) => {
        const d = droidById.get(ing.droidId)
        return (
          <div key={ing.droidId} className="dc-row">
            <div className="dc-row-main">
              <span className="dc-row-label">{d?.name ?? ing.droidId}</span>
              <span className="dc-row-sub">{t('common.quantity', { n: ing.quantity })}</span>
            </div>
          </div>
        )
      })}
    </InsetGroup>
  )
}
