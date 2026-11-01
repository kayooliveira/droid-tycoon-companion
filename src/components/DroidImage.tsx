import { droidImageSrc, isMissingImageFlag } from '../lib/images'
import { cn } from '../lib/utils'
import type { Droid } from '../domain/types'

function initialsFor(name: string, id: string): string {
  const fromName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2)
  if (fromName.length >= 2) return fromName.toUpperCase()
  return id.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?'
}

export function DroidImage({
  droid,
  size = 'md',
  className,
  priority,
}: {
  droid: Pick<Droid, 'id' | 'imageLocal' | 'imageMissing' | 'name'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}) {
  const sizes = { sm: 'h-10 w-10', md: 'h-14 w-14', lg: 'h-24 w-24' }
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }
  const missing = isMissingImageFlag(droid) || !droid.imageLocal
  const src = missing ? null : droidImageSrc(droid.id, droid.imageLocal)

  if (missing || !src) {
    const initials = initialsFor(droid.name, droid.id)
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl ring-1 ring-ui',
          'bg-gradient-to-br from-surface-800 via-holo-900/40 to-cyan-900/30',
          'flex items-center justify-center',
          sizes[size],
          className,
        )}
        role="img"
        aria-label={droid.name}
      >
        <span
          className={cn('font-bold text-holo-200/90 select-none', textSizes[size])}
          aria-hidden
        >
          {initials}
        </span>
        <span
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 55%)',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl bg-ui-field ring-1 ring-ui',
        sizes[size],
        className,
      )}
    >
      <img
        src={src}
        alt={droid.name}
        width={size === 'lg' ? 96 : size === 'md' ? 56 : 40}
        height={size === 'lg' ? 96 : size === 'md' ? 56 : 40}
        className="h-full w-full object-cover bg-ui-field"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  )
}
