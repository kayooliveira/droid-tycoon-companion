import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

export function SellBadge({ sellable, className }: { sellable: boolean; className?: string }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'sell-badge',
        sellable ? 'sell-badge--ok' : 'sell-badge--no',
        className,
      )}
    >
      {sellable ? t('progress.badgeCanSell') : t('progress.badgeDoNotSell')}
    </span>
  )
}
