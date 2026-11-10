import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { droidById } from '../../domain/gameData'
import { formatTierName } from '../../domain/tiers'
import { formatBaseRarity } from '../../i18n/tierLabels'
import { useTierLabels } from '../../i18n/useTierLabels'
import type { TierId } from '../../domain/types'
import { DroidImage } from '../DroidImage'
import { InsetGroup } from '../ui/InsetGroup'
import { Sheet } from '../ui/Sheet'
import { SellBadge } from '../ui/SellBadge'

export function DroidDetailSheet({
  open,
  onClose,
  droidId,
  tier,
  quantity,
  sellable,
  children,
}: {
  open: boolean
  onClose: () => void
  droidId: string | null
  tier: TierId
  quantity?: number
  sellable?: boolean
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const droid = droidId ? droidById.get(droidId) : null
  if (!droid) return null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      testId="droid-detail-sheet"
      closeLabel={t('common.close')}
      headerLabel={droid.name}
    >
      <div className="sheet-art">
        <DroidImage droid={droid} tier={tier} size="lg" quantity={quantity} />
      </div>
      <div className="sheet-title">
        <h2 className="sheet-name dname">{droid.name}</h2>
        <span className="sheet-tier">{formatTierName(tier, tierLabels)}</span>
      </div>
      <p className="t-meta">
        {formatBaseRarity(droid.baseRarity, t)} · {formatTierName(tier, tierLabels)}
      </p>
      <InsetGroup>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('inventory.filterTier')}</span>
            <span className="hint">{formatTierName(tier, tierLabels)}</span>
          </div>
        </div>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('inventory.filterRarity')}</span>
            <span className="hint">{formatBaseRarity(droid.baseRarity, t)}</span>
          </div>
        </div>
        {quantity != null ? (
          <div className="row">
            <div className="row-main">
              <span className="row-title">{t('inventory.quantity')}</span>
              <span className="hint">{quantity}</span>
            </div>
          </div>
        ) : null}
        {sellable != null ? (
          <div className="row">
            <div className="row-main">
              <span className="row-title">{t('sell.title')}</span>
              <span className="hint">
                <SellBadge sellable={sellable} />
              </span>
            </div>
          </div>
        ) : null}
      </InsetGroup>
      {children}
    </Sheet>
  )
}
