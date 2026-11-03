import { droidImageSrc, isMissingImageFlag } from '../lib/images'
import { cn } from '../lib/utils'
import type { Droid, TierId } from '../domain/types'
import { tierSurfaceClass } from './ui/tierVisuals'

function initialsFor(name: string, id: string): string {
  const fromName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2)
  if (fromName.length >= 2) return fromName.toUpperCase()
  return id.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?'
}

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
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }
  const missing = isMissingImageFlag(droid) || !droid.imageLocal
  const src = missing ? null : droidImageSrc(droid.id, droid.imageLocal)

  const backdropClass = cn(
    'tier-droid-backdrop',
    tierSurfaceClass(tier),
    sizes[size],
    className,
  )

  if (missing || !src) {
    const initials = initialsFor(droid.name, droid.id)
    return (
      <div className={backdropClass} role="img" aria-label={droid.name}>
        <span className={cn('tier-droid-backdrop__initials', textSizes[size])} aria-hidden>
          {initials}
        </span>
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
