import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cycleById, droidById } from '../../domain/gameData'
import { formatTierName } from '../../domain/tiers'
import { formatBaseRarity } from '../../i18n/tierLabels'
import { useTierLabels } from '../../i18n/useTierLabels'
import { DroidImage } from '../DroidImage'
import { Modal } from '../ui/Modal'
import { ChipRadioGroup } from '../ui/ChipRadioGroup'
import { cycleDisplayNameForId } from '../../lib/cycleLabel'
import { formatVerifiedDatePt } from '../../lib/formatVerifiedDate'

const GATE_GRID_IDS = [
  'mouse',
  'pit',
  'cb',
  'bb',
  'orb-walker',
  'r6',
  'mecha-droid',
  'bb9',
  'lep',
  'cyclens',
  'bb-8',
  'c-3po',
] as const

/** Grid + modal matching `droiddex.html` / `droiddex-detalhe.html`. */
export function DroiddexGateView() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? droidById.get(selectedId) : null

  const classOptions = [
    { value: 'all', label: 'Todas classes' },
    { value: 'Worker', label: 'Worker' },
    { value: 'Astromech', label: 'Astromech' },
    { value: 'Battle', label: 'Battle' },
    { value: 'Protocol', label: 'Protocol' },
  ]

  return (
    <>
      <div className="field-wrap" style={{ marginTop: 12 }}>
        <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.9-4.9" />
        </svg>
        <input className="field" type="search" placeholder="Buscar droids…" aria-label="Buscar droids" />
      </div>
      <div style={{ marginTop: 12 }}>
        <ChipRadioGroup
          ariaLabel="Todas classes"
          value="all"
          onChange={() => {}}
          options={classOptions}
        />
      </div>
      <div className="collection-grid" data-testid="droiddex-grid" style={{ marginTop: 18 }}>
        {GATE_GRID_IDS.map((id) => {
          const d = droidById.get(id)
          if (!d) return null
          return (
            <button
              key={id}
              type="button"
              className="collect-card"
              onClick={() => setSelectedId(id)}
            >
              <div className="collect-art">
                <DroidImage droid={d} tier="default" className="!h-full !w-full rounded-none" />
              </div>
              <div className="collect-body">
                <span className="dname">{d.name}</span>
                <span className="collect-meta">{formatBaseRarity(d.baseRarity, t)}</span>
              </div>
            </button>
          )
        })}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? 'Droiddex'}
        testId="droiddex-detail-modal"
      >
        {selected ? (
          <div className="stack">
            <div
              className="row2"
              style={{ alignItems: 'flex-start', gap: 14, margin: '10px 0 14px' }}
            >
              <div style={{ width: 96, flex: 'none' }}>
                <DroidImage droid={selected} tier="kyber" size="md" priority />
              </div>
              <div className="stack" style={{ gap: 8, alignItems: 'flex-start' }}>
                <span className="tag tag--mute">
                  <i className="tag-sq" aria-hidden />
                  {selected.class}
                </span>
                <span className="tag tag--mute">
                  <i className="tag-sq" aria-hidden />
                  {formatBaseRarity(selected.baseRarity, t)}
                </span>
                <span className="tag tag--ok">
                  <i className="tag-sq" aria-hidden />
                  {t('confidence.confirmed')}
                </span>
              </div>
            </div>
            <span className="lbl">Níveis</span>
            <p style={{ marginBottom: 12 }}>
              {selected.tiersAvailable.map((tier) => formatTierName(tier, tierLabels)).join(' · ')}
            </p>
            <span className="lbl">Aparece nos renascimentos</span>
            {selected.requiredIn?.slice(0, 3).map((r) => (
              <div key={`${r.cycle}-${r.rebirth}`} className="kv">
                <span>
                  {cycleDisplayNameForId(r.cycle, cycleById.get(r.cycle)?.name, i18n.language)} R
                  {r.rebirth}
                </span>
                <b>{formatTierName(r.rarity, tierLabels)}</b>
              </div>
            ))}
            {(selected.requiredIn?.length ?? 0) > 3 ? (
              <p className="hint" style={{ margin: '6px 0 4px' }}>
                + 3 a mais
              </p>
            ) : null}
            <a className="link-btn" href={selected.sourceUrl}>
              {t('droiddex.source', {
                date: formatVerifiedDatePt(selected.lastVerified, i18n.language),
              })}
            </a>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
