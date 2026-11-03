import { Robot } from '@phosphor-icons/react'
import { droidImageSrc, isMissingImageFlag } from '../lib/images'
import { cn } from '../lib/utils'
import type { Droid, TierId } from '../domain/types'
import { tierSurfaceClass } from './ui/tierVisuals'
import { uiIconProps } from './ui/iconStyle'

export function DroidImage({
  droid,
  tier = 'default',
  size = 'md',
  className,
  priority,
}: {
  droid: Pick<Droid, 'id' | 'imageLocal' | 'imageMissing' | 'name'>
  tier?: TierId
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}) {
  const sizes = { sm: 'h-10 w-10', md: 'h-14 w-14', lg: 'h-24 w-24' }
  const iconSizes = { sm: 22, md: 28, lg: 40 } as const
  const missing = isMissingImageFlag(droid) || !droid.imageLocal
  const src = missing ? null : droidImageSrc(droid.id, droid.imageLocal)

  const backdropClass = cn(
    'tier-droid-backdrop',
    tierSurfaceClass(tier),
    sizes[size],
    className,
  )

  if (missing || !src) {
    return (
      <div className={backdropClass} role="img" aria-label={droid.name}>
        <Robot
          {...uiIconProps}
          size={iconSizes[size]}
          className="tier-droid-backdrop__placeholder shrink-0 opacity-70"
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div className={backdropClass}>
      <img
        src={src}
        alt={droid.name}
        width={size === 'lg' ? 96 : size === 'md' ? 56 : 40}
        height={size === 'lg' ? 96 : size === 'md' ? 56 : 40}
        className="tier-droid-backdrop__img"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  )
}
