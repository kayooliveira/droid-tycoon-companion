import { Robot } from '@phosphor-icons/react'
import { droidImageSrc, isMissingImageFlag } from '../lib/images'
import { cn } from '../lib/utils'
import type { Droid, TierId } from '../domain/types'
import { uiIconProps } from './ui/iconStyle'

const TIER_NUM: Record<TierId, string> = {
  default: '01',
  gold: '02',
  diamond: '03',
  rainbow: '04',
  beskar: '05',
  galactic: '06',
  stellar: '07',
  kyber: '08',
  scourge: 'S',
}

const SIZE_CLASS = {
  sm: 'dtile--sm',
  md: '',
  lg: 'dtile--lg',
  xs: 'dtile--xs',
} as const

export function DroidImage({
  droid,
  tier = 'default',
  size = 'md',
  className,
  priority,
  quantity,
  missing,
}: {
  droid: Pick<Droid, 'id' | 'imageLocal' | 'imageMissing' | 'name'>
  tier?: TierId
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
  quantity?: number
  missing?: boolean
}) {
  const isMissing = missing ?? (isMissingImageFlag(droid) || !droid.imageLocal)
  const src = isMissing ? null : droidImageSrc(droid.id, droid.imageLocal)

  return (
    <span
      className={cn('dtile', SIZE_CLASS[size], isMissing && 'dtile--missing', className)}
      data-tier={tier}
      role="img"
      aria-label={droid.name}
    >
      <span className="dtile-bg" aria-hidden />
      <span className="dtile-num" aria-hidden>
        {TIER_NUM[tier]}
      </span>
      {src ? (
        <img
          src={src}
          alt=""
          width={128}
          height={128}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      ) : (
        <Robot
          {...uiIconProps}
          size={size === 'lg' ? 40 : size === 'sm' || size === 'xs' ? 22 : 28}
          className="ic"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '10%',
            transform: 'translateX(-50%)',
            opacity: 0.7,
          }}
          aria-hidden
        />
      )}
      {quantity != null && quantity > 1 ? (
        <span className="dtile-qty" aria-label={`quantidade ${quantity}`}>
          ×{quantity}
        </span>
      ) : null}
      <span className="dtile-q" aria-hidden>
        ?
      </span>
    </span>
  )
}
