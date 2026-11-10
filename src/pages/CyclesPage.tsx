import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CycleGuidePdfExport } from '../components/CycleGuidePdfExport'
import { DroidImage } from '../components/DroidImage'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { InsetGroup } from '../components/ui/InsetGroup'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import { formatTierName } from '../domain/tiers'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { useTierLabels } from '../i18n/useTierLabels'
export function CyclesPage() {
  const { t, i18n } = useTranslation()
  const tierLabels = useTierLabels()
  const [pathId, setPathId] = useState(gameData.cycles[0]?.id ?? 'path-1')
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
      <InsetGroup footer={t('cycles.referenceNote')}>
        <div className="px-4 py-3">
          <div className="chips chips--scroll" data-testid="cycles-path-chips">
            <SegmentedControl
              compact
              className="!mx-0"
              ariaLabel={t('cycles.pickCycle')}
              value={pathId}
              onChange={(id) => {
                setPathId(id)
                setOpenRebirth(1)
              }}
              options={cycleOptions}
            />
          </div>
        </div>
        <div className="row">
          <CycleGuidePdfExport pathId={pathId} cycleName={cycleName} />
        </div>
      </InsetGroup>

      <div className="stack">
      {rebirths.map((entry) => {
        const open = openRebirth === entry.rebirth
        return (
          <InsetGroup key={entry.rebirth} testId={`cycles-rebirth-group-${entry.rebirth}`}>
            <button
              type="button"
              className="row row row--link w-full"
              onClick={() => setOpenRebirth(open ? null : entry.rebirth)}
              data-testid={`cycles-rebirth-${entry.rebirth}`}
              aria-expanded={open}
            >
              <div className="row-main">
                <span className="row-title">{t('cycles.rebirthN', { n: entry.rebirth })}</span>
                <span className="hint">
                  {entry.credits} · {t(`confidence.${entry.confidence}`)}
                </span>
              </div>
            </button>
            {open ? (
              <>
                {entry.note ? (
                  <div className="row">
                    <span className="hint text-ui-warn">{entry.note}</span>
                  </div>
                ) : null}
                {entry.requirements.map((req) => {
                  const droid = droidById.get(req.droidId)
                  return (
                    <div key={req.droidId} className="row item">
                      {droid ? (
                        <DroidImage
                          droid={droid}
                          tier={req.rarity}
                          size="sm"
                          className="!h-[50px] !w-[50px] rounded-[11px]"
                        />
                      ) : null}
                      <div className="row-main">
                        <span className="dname row-title">{droid?.name ?? req.droidId}</span>
                        <span className="hint">
                          {formatTierName(req.rarity, tierLabels)}
                          {req.quantity > 1 ? ` · ×${req.quantity}` : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : null}
          </InsetGroup>
        )
      })}
      </div>

      <h2 className="sec-h" data-testid="cycles-super-section-header">
        {t('cycles.superSection')}
      </h2>
      <InsetGroup>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('cycles.superBody', { n: SUPER_REBIRTH_UNLOCK_AFTER })}</span>
            <span className="hint">{t('common.unconfirmed')}</span>
          </div>
        </div>
      </InsetGroup>

      <div aria-hidden />
    </TabScrollLayout>
  )
}
