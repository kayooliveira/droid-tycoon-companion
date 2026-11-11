import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { IcTagCheck, IcTagX } from '../inventoryIcons'

export function SellBadge({ sellable, className }: { sellable: boolean; className?: string }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(sellable ? 'tag tag--ok' : 'tag tag--bad', className)}
    >
      <i className="tag-sq" aria-hidden />
      {sellable ? (
        <>
          <IcTagCheck />
          {t('progress.badgeCanSell')}
        </>
      ) : (
        <>
          <IcTagX />
          {t('progress.badgeDoNotSell')}
        </>
      )}
    </span>
  )
}
