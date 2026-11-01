import { useTranslation } from 'react-i18next'
import { SUPER_REBIRTH_UNLOCK_AFTER } from '../../domain/progress'
import { cn } from '../../lib/utils'

export function CycleTimeline({ completed }: { completed: number }) {
  const { t } = useTranslation()
  const total = 40
  return (
    <div className="space-y-2" data-testid="cycle-timeline">
      <p className="text-xs font-medium text-ui-muted">{t('home.timelineTitle')}</p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          const done = n <= completed
          const isSuper = n === SUPER_REBIRTH_UNLOCK_AFTER
          return (
            <span
              key={n}
              title={isSuper ? t('home.superMarker') : `#${n}`}
              className={cn(
                'h-2 w-2 rounded-full shrink-0',
                done ? 'bg-holo-400' : 'bg-zinc-500/40',
                isSuper && 'ring-1 ring-amber-400/80 ring-offset-1 ring-offset-transparent scale-125',
              )}
            />
          )
        })}
      </div>
      <p className="text-[10px] text-ui-soft">
        {t('home.superAtRebirth', { n: SUPER_REBIRTH_UNLOCK_AFTER })}
      </p>
    </div>
  )
}
