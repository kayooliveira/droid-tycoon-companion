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
    <Sheet open={open} onClose={onClose} testId="droid-detail-sheet">
      <div className="pb-2">
        <DroidImage droid={droid} tier={tier} size="lg" className="!h-auto !w-full max-w-sm mx-auto aspect-square rounded-2xl" />
        <h2 className="text-center text-[22px] font-bold leading-[26px] tracking-[-0.3px] mt-4 mb-3 px-1">
          {droid.name}
        </h2>
        <InsetGroup>
          <div className="dc-row">
            <div className="dc-row-main">
              <span className="dc-row-label">{t('inventory.filterTier')}</span>
              <span className="dc-row-sub">{formatTierName(tier, tierLabels)}</span>
            </div>
          </div>
          <div className="dc-row">
            <div className="dc-row-main">
              <span className="dc-row-label">{t('inventory.filterRarity')}</span>
              <span className="dc-row-sub">{formatBaseRarity(droid.baseRarity, t)}</span>
            </div>
          </div>
          {quantity != null ? (
            <div className="dc-row">
              <div className="dc-row-main">
                <span className="dc-row-label">{t('inventory.quantity')}</span>
                <span className="dc-row-sub">{quantity}</span>
              </div>
            </div>
          ) : null}
          {sellable != null ? (
            <div className="dc-row">
              <div className="dc-row-main">
                <span className="dc-row-label">{t('sell.title')}</span>
                <span className="dc-row-sub">
                  <SellBadge sellable={sellable} />
                </span>
              </div>
            </div>
          ) : null}
        </InsetGroup>
        {children}
      </div>
    </Sheet>
  )
}
