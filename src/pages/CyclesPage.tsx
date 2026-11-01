import { useMemo, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { CycleGuidePdfExport } from '../components/CycleGuidePdfExport'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../domain/progress'
import { formatTierName } from '../domain/tiers'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { useTierLabels } from '../i18n/useTierLabels'
import { cn } from '../lib/utils'
import { uiIconProps } from '../components/ui/iconStyle'

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

  return (
    <div className="space-y-5 pb-6">
      <div className="space-y-2">
        <h1 className="hidden md:block font-display text-2xl tracking-wide">{t('cycles.title')}</h1>
        <p className="text-sm text-zinc-400 text-pretty">{t('cycles.referenceNote')}</p>
      </div>

      <GlassCard className="p-4 space-y-3">
        <p className="text-sm font-medium text-zinc-200">{t('cycles.pickCycle')}</p>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label={t('cycles.pickCycle')}
          data-testid="cycles-path-chips"
        >
          {gameData.cycles.map((c) => {
            const selected = pathId === c.id
            const label = formatCycleDisplayName(c.name, i18n.language)
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                data-testid={`cycles-chip-${c.id}`}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm min-h-11 border font-medium transition-colors',
                  selected
                    ? 'border-holo-400/70 bg-holo-600/25 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200',
                )}
                onClick={() => {
                  setPathId(c.id)
                  setOpenRebirth(1)
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        <CycleGuidePdfExport pathId={pathId} cycleName={cycleName} />
      </GlassCard>

      <div className="space-y-2">
        {rebirths.map((entry) => {
          const open = openRebirth === entry.rebirth
          return (
            <GlassCard key={entry.rebirth} className="overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center gap-3 text-left px-4 py-3 min-h-11"
                onClick={() => setOpenRebirth(open ? null : entry.rebirth)}
                data-testid={`cycles-rebirth-${entry.rebirth}`}
              >
                <CaretDown
                  {...uiIconProps}
                  className={cn('shrink-0 transition-transform', open ? 'rotate-180' : '')}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t('cycles.rebirthN', { n: entry.rebirth })}</p>
                  <p className="text-xs text-zinc-500">{entry.credits}</p>
                </div>
                <Badge tone={entry.confidence === 'confirmed' ? 'success' : 'warn'}>
                  {t(`confidence.${entry.confidence}`)}
                </Badge>
              </button>
              {open ? (
                <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3">
                  {entry.note ? (
                    <p className="text-xs text-amber-200/90 text-pretty">{entry.note}</p>
                  ) : null}
                  {entry.requirements.map((req) => {
                    const droid = droidById.get(req.droidId)
                    return (
                      <div key={req.droidId} className="flex items-center gap-3">
                        {droid ? <DroidImage droid={droid} size="sm" /> : null}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{droid?.name ?? req.droidId}</p>
                          <p className="text-xs text-zinc-500">
                            {formatTierName(req.rarity, tierLabels)}
                            {req.quantity > 1 ? ` ×${req.quantity}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </GlassCard>
          )
        })}
      </div>

      <GlassCard className="p-4 space-y-2">
        <h2 className="font-display text-lg">{t('cycles.superSection')}</h2>
        <p className="text-sm text-zinc-300 text-pretty">
          {t('cycles.superBody', { n: SUPER_REBIRTH_UNLOCK_AFTER })}
        </p>
        <Badge tone="info">{t('common.unconfirmed')}</Badge>
      </GlassCard>
    </div>
  )
}
