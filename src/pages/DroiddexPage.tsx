import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gameData } from '../domain/gameData'
import { formatTierName } from '../domain/tiers'
import { formatBaseRarity } from '../i18n/tierLabels'
import { useTierLabels } from '../i18n/useTierLabels'
import { DroidImage } from '../components/DroidImage'
import { showcaseTierForDroid } from '../components/ui/tierVisuals'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { droidMatchesQuery } from '../lib/droidNameMatch'
import type { Droid } from '../domain/types'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { SearchInput } from '../components/ui/SearchInput'
import { SegmentedControl } from '../components/ui/SegmentedControl'

const DROID_CLASSES = ['Worker', 'Astromech', 'Battle', 'Protocol'] as const

export function DroiddexPage() {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Droid | null>(null)
  const [classFilter, setClassFilter] = useState<string>('all')

  const droids = useMemo(() => {
    return gameData.droids
      .filter((d) => {
        if (classFilter !== 'all' && d.class !== classFilter) return false
        if (search && !droidMatchesQuery(search, d.name, d.id)) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [search, classFilter])

  return (
    <TabScrollLayout title={t('droiddex.title')} testId="droiddex-page">
      <SearchInput
        placeholder={t('droiddex.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        clearLabel={t('progress.search.clear')}
        aria-label={t('droiddex.search')}
      />
      <div className="chips chips--scroll">
        <SegmentedControl
          ariaLabel={t('droiddex.allClasses')}
          value={classFilter}
          onChange={setClassFilter}
          options={[
            { value: 'all', label: t('droiddex.allClasses') },
            ...DROID_CLASSES.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        data-testid="droiddex-grid"
      >
        {droids.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d)}
            className="collect-card flex flex-col items-stretch p-3"
          >
            <DroidImage droid={d} tier={showcaseTierForDroid(d)} className="self-center mb-2" />
            <p className="text-sm font-medium truncate w-full">{d.name}</p>
            <p className="text-[10px] text-ui-muted">{formatBaseRarity(d.baseRarity, t)}</p>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? t('droiddex.title')}
        testId="droiddex-detail-modal"
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <DroidImage droid={selected} tier={showcaseTierForDroid(selected)} size="lg" />
              <div className="space-y-2 text-sm">
                <Badge>{selected.class}</Badge>
                <Badge tone="info">{formatBaseRarity(selected.baseRarity, t)}</Badge>
                {selected.fusionOnly ? <Badge tone="warn">{t('droiddex.fusionOnly')}</Badge> : null}
                <Badge tone={selected.confidence === 'confirmed' ? 'success' : 'warn'}>
                  {t(`confidence.${selected.confidence}`)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-ui-soft mb-1">{t('droiddex.tiers')}</p>
              <p className="text-sm">
                {selected.tiersAvailable.map((tier) => formatTierName(tier, tierLabels)).join(' · ')}
              </p>
            </div>
            {selected.requiredIn?.length ? (
              <div>
                <p className="text-xs text-ui-soft mb-1">{t('droiddex.requiredIn')}</p>
                <ul className="text-xs space-y-1 max-h-40 overflow-auto">
                  {selected.requiredIn.slice(0, 12).map((r) => (
                    <li key={`${r.cycle}-${r.rebirth}-${r.rarity}`}>
                      {r.cycle} R{r.rebirth} · {formatTierName(r.rarity, tierLabels)}
                    </li>
                  ))}
                  {(selected.requiredIn.length ?? 0) > 12 ? (
                    <li className="text-ui-soft">
                      {t('droiddex.moreRequirements', { n: selected.requiredIn.length - 12 })}
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-ui-soft">{t('droiddex.notRequired')}</p>
            )}
            <a
              href={selected.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ui-accent hover:underline"
            >
              {t('droiddex.source', { date: selected.lastVerified })}
            </a>
          </div>
        ) : null}
      </Modal>
    </TabScrollLayout>
  )
}
