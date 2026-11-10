import { useMemo, useState } from 'react'
import { isDesignGateCapture } from '../e2e/designGate'
import { CyclesGateView } from '../components/cycles/CyclesGateView'
import { useTranslation } from 'react-i18next'
import { CycleGuidePdfExport } from '../components/CycleGuidePdfExport'
import { DroidImage } from '../components/DroidImage'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { ChipRadioGroup } from '../components/ui/ChipRadioGroup'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import { formatTierName } from '../domain/tiers'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { useTierLabels } from '../i18n/useTierLabels'

const GATE_VISIBLE_REBIRTHS = 4

export function CyclesPage() {
  const { t, i18n } = useTranslation()
  if (isDesignGateCapture()) {
    return (
      <TabScrollLayout title={t('cycles.title')} testId="cycles-page">
        <CyclesGateView />
      </TabScrollLayout>
    )
  }
  const tierLabels = useTierLabels()
  const [pathId, setPathId] = useState('path-5')
  const [openRebirth, setOpenRebirth] = useState<number | null>(1)

  const cycle = cycleById.get(pathId)
  const cycleName = cycle
    ? formatCycleDisplayName(cycle.name, i18n.language)
    : pathId

  const rebirths = useMemo(() => {
    const list = []
    for (let n = 1; n <= REBIRTHS_PER_PATH; n++) {
      const entry = getRebirth(pathId, n)
      if (entry) list.push(entry)
    }
    return list
  }, [pathId])

  const visibleRebirths = rebirths.slice(0, GATE_VISIBLE_REBIRTHS)

  const cycleOptions = useMemo(
    () =>
      gameData.cycles.map((c) => ({
        value: c.id,
        label: formatCycleDisplayName(c.name, i18n.language),
      })),
    [i18n.language],
  )

  return (
    <TabScrollLayout title={t('cycles.title')} testId="cycles-page">
      <p className="hint" style={{ marginTop: 6 }}>
        {t('cycles.referenceNote')}
      </p>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('cycles.pickCycle')}</h2>
        </div>
        <ChipRadioGroup
          ariaLabel={t('cycles.pickCycle')}
          testId="cycles-path-chips"
          grid
          value={pathId}
          onChange={(id) => {
            setPathId(id)
            setOpenRebirth(1)
          }}
          options={cycleOptions}
        />
        <div style={{ marginTop: 14 }}>
          <CycleGuidePdfExport pathId={pathId} cycleName={cycleName} />
        </div>
      </section>

      {visibleRebirths.map((entry) => {
        const open = openRebirth === entry.rebirth
        return (
          <div key={entry.rebirth} className="acc" data-testid={`cycles-rebirth-group-${entry.rebirth}`}>
            <button
              type="button"
              className="acc-h"
              onClick={() => setOpenRebirth(open ? null : entry.rebirth)}
              data-testid={`cycles-rebirth-${entry.rebirth}`}
              aria-expanded={open}
            >
              <span className="row-main">
                <span className="dname" style={{ display: 'block' }}>
                  {t('cycles.rebirthN', { n: entry.rebirth })}
                </span>
                <span className="hint" style={{ display: 'block' }}>
                  {entry.credits} · {t(`confidence.${entry.confidence}`)}
                </span>
              </span>
              <span className="chev" aria-hidden>
                <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
                  <path d={open ? 'm5 9 7 7 7-7' : 'm9 5 7 7-7 7'} />
                </svg>
              </span>
            </button>
            {open ? (
              <div className="acc-body">
                {entry.note ? (
                  <p className="note-warn" style={{ padding: '4px 0 8px' }}>
                    {entry.note}
                  </p>
                ) : null}
                {entry.requirements.map((req) => {
                  const droid = droidById.get(req.droidId)
                  return (
                    <div key={req.droidId} className="item">
                      <button type="button" className="item-open" aria-label={droid?.name}>
                        {droid ? <DroidImage droid={droid} tier={req.rarity} size="sm" /> : null}
                        <span className="item-body">
                          <span className="dname">{droid?.name ?? req.droidId}</span>
                          <span className="t-meta">
                            {formatTierName(req.rarity, tierLabels)}
                            {req.quantity > 1 ? ` · ×${req.quantity}` : ''}
                          </span>
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}

      {rebirths.length > GATE_VISIBLE_REBIRTHS ? (
        <p className="hint" style={{ margin: '10px 0 0' }}>
          {t('cycles.moreRebirthsBelow', {
            count: rebirths.length - GATE_VISIBLE_REBIRTHS,
            defaultValue: `Mais ${rebirths.length - GATE_VISIBLE_REBIRTHS} renascimentos abaixo, na mesma lista.`,
          })}
        </p>
      ) : null}

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('cycles.superSection')}</h2>
        </div>
        <p style={{ marginBottom: 8 }}>{t('cycles.superBody', { n: SUPER_REBIRTH_UNLOCK_AFTER })}</p>
        <span className="hint">{t('common.unconfirmed')}</span>
      </section>

      <div aria-hidden />
    </TabScrollLayout>
  )
}
