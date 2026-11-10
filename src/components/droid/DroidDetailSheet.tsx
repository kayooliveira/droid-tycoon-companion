import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash } from '@phosphor-icons/react'
import { droidById } from '../../domain/gameData'
import { formatTierName } from '../../domain/tiers'
import { formatBaseRarity } from '../../i18n/tierLabels'
import { useTierLabels } from '../../i18n/useTierLabels'
import type { TierId } from '../../domain/types'
import { DroidImage } from '../DroidImage'
import { Sheet } from '../ui/Sheet'
import { SellBadge } from '../ui/SellBadge'
import { uiIconProps } from '../ui/iconStyle'

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

  const tierName = formatTierName(tier, tierLabels)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      testId="droid-detail-sheet"
      closeLabel={t('common.close')}
      renderHeader={false}
      ariaLabel={`${droid.name} ${tierName}`}
      labelledBy="droid-detail-sheet-label"
    >
      <div className="sheet-h">
        <span className="t-label" id="droid-detail-sheet-label">
          {t('droid.sheetKicker')}
        </span>
        <button
          type="button"
          className="btn btn--icon btn--secondary"
          aria-label={t('common.close')}
          data-testid="droid-detail-sheet-close"
          onClick={onClose}
        >
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
          </svg>
        </button>
      </div>
      <div className="sheet-art">
        <DroidImage droid={droid} tier={tier} size="lg" quantity={quantity} />
      </div>
      <div className="sheet-title">
        <h2 className="sheet-name dname">{droid.name}</h2>
        <span className="sheet-tier">{tierName}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="kv">
          <span>{t('inventory.filterTier')}</span>
          <b>{tierName}</b>
        </div>
        <div className="kv">
          <span>{t('inventory.filterRarity')}</span>
          <b>{formatBaseRarity(droid.baseRarity, t)}</b>
        </div>
        {quantity != null ? (
          <div className="kv">
            <span>{t('inventory.quantity')}</span>
            <b>{quantity}</b>
          </div>
        ) : null}
        {sellable != null ? (
          <div className="kv">
            <span>{t('sell.title')}</span>
            <SellBadge sellable={sellable} />
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="stack" style={{ marginTop: 12 }}>
          {children}
        </div>
      ) : null}
    </Sheet>
  )
}

export function DroidDetailRemoveButton({
  label,
  onClick,
  testId,
}: {
  label: string
  onClick: () => void
  testId?: string
}) {
  return (
    <button type="button" className="btn btn--ghost" data-testid={testId} onClick={onClick}>
      <Trash {...uiIconProps} className="ic" />
      {label}
    </button>
  )
}
