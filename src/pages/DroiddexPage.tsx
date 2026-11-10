import { useMemo, useState } from 'react'
import { isDesignGateCapture } from '../e2e/designGate'
import { DroiddexGateView } from '../components/droiddex/DroiddexGateView'
import { useGateTabbarAnchor } from '../hooks/useGateTabbarAnchor'
import { useTranslation } from 'react-i18next'
import { cycleById, gameData } from '../domain/gameData'
import { formatTierName } from '../domain/tiers'
import { formatBaseRarity } from '../i18n/tierLabels'
import { useTierLabels } from '../i18n/useTierLabels'
import { DroidImage } from '../components/DroidImage'
import { Modal } from '../components/ui/Modal'
import { droidMatchesQuery } from '../lib/droidNameMatch'
import type { Droid } from '../domain/types'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { MoreBackBar } from '../components/layout/MoreBackBar'
import { SearchInput } from '../components/ui/SearchInput'
import { ChipRadioGroup } from '../components/ui/ChipRadioGroup'
import { cycleDisplayNameForId } from '../lib/cycleLabel'
import { formatVerifiedDatePt } from '../lib/formatVerifiedDate'

const DROID_CLASSES = ['Worker', 'Astromech', 'Battle', 'Protocol'] as const

export function DroiddexPage() {
  useGateTabbarAnchor()
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Droid | null>(null)
  const [classFilter, setClassFilter] = useState<string>('all')

  const classOptions = useMemo(
    () => [
      { value: 'all', label: t('droiddex.allClasses') },
      ...DROID_CLASSES.map((c) => ({ value: c, label: c })),
    ],
    [t],
  )

  const droids = useMemo(() => {
    return gameData.droids
      .filter((d) => {
        if (classFilter !== 'all' && d.class !== classFilter) return false
        if (search && !droidMatchesQuery(search, d.name, d.id)) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [search, classFilter])

  if (isDesignGateCapture()) {
    return (
      <TabScrollLayout title={t('droiddex.title')} testId="droiddex-page" backBar={<MoreBackBar />}>
        <DroiddexGateView />
      </TabScrollLayout>
    )
  }

  return (
    <TabScrollLayout title={t('droiddex.title')} testId="droiddex-page" backBar={<MoreBackBar />}>
      <SearchInput
        placeholder={t('droiddex.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        clearLabel={t('progress.search.clear')}
        aria-label={t('droiddex.search')}
      />
      <ChipRadioGroup
        ariaLabel={t('droiddex.allClasses')}
        value={classFilter}
        onChange={setClassFilter}
        options={classOptions}
      />

      <div className="collection-grid" data-testid="droiddex-grid">
        {droids.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d)}
            className="collect-card"
          >
            <div className="collect-art">
              <DroidImage droid={d} tier="default" className="!h-full !w-full rounded-none" />
            </div>
            <div className="collect-body">
              <span className="dname">{d.name}</span>
              <span className="collect-meta">{formatBaseRarity(d.baseRarity, t)}</span>
            </div>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? t('droiddex.title')}
        testId="droiddex-detail-modal"
        anchorAboveMobileNav
      >
        {selected ? (
          <div className="stack">
            <div className="droiddex-detail-art">
              <DroidImage droid={selected} tier="default" size="md" />
            </div>
            <div className="droiddex-detail-tags">
              <span className="chip">{selected.class}</span>
              <span className="chip">{formatBaseRarity(selected.baseRarity, t)}</span>
              <span className={selected.confidence === 'confirmed' ? 'tag tag--ok' : 'tag tag--bad'}>
                <i className="tag-sq" aria-hidden />
                {t(`confidence.${selected.confidence}`)}
              </span>
            </div>
            <section>
              <h3 className="t-h2">{t('droiddex.tiers')}</h3>
              <p className="hint">
                {selected.tiersAvailable.map((tier) => formatTierName(tier, tierLabels)).join(' · ')}
              </p>
            </section>
            {selected.requiredIn?.length ? (
              <div>
                <h3 className="t-h2">{t('droiddex.requiredIn')}</h3>
                <ul className="stack" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selected.requiredIn.slice(0, 12).map((r) => {
                    const cycleName = cycleDisplayNameForId(
                      r.cycle,
                      cycleById.get(r.cycle)?.name,
                      i18n.language,
                    )
                    return (
                      <li key={`${r.cycle}-${r.rebirth}-${r.rarity}`} className="droiddex-req-row">
                        <span className="t-meta">
                          {cycleName} R{r.rebirth}
                        </span>
                        <span className="dname">{formatTierName(r.rarity, tierLabels)}</span>
                      </li>
                    )
                  })}
                </ul>
                {(selected.requiredIn.length ?? 0) > 12 ? (
                  <p className="hint">
                    {t('droiddex.moreRequirements', { n: selected.requiredIn.length - 12 })}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="hint">{t('droiddex.notRequired')}</p>
            )}
            <a
              href={selected.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="droiddex-source"
            >
              {t('droiddex.source', {
                date: formatVerifiedDatePt(selected.lastVerified, i18n.language),
              })}
            </a>
          </div>
        ) : null}
      </Modal>
    </TabScrollLayout>
  )
}
