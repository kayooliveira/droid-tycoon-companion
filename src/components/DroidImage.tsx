import { droidImageSrc, isMissingImageFlag } from '../lib/images'
import { cn } from '../lib/utils'
import type { Droid } from '../domain/types'

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
  const missing = isMissingImageFlag(droid)
  const src = droidImageSrc(droid.id, droid.imageLocal)

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl bg-surface-800 ring-1 ring-white/10',
        sizes[size],
        className,
      )}
    >
      <img
        src={src}
        alt={droid.name}
        width={size === 'lg' ? 96 : size === 'md' ? 56 : 40}
        height={size === 'lg' ? 96 : size === 'md' ? 56 : 40}
        className="h-full w-full object-cover bg-surface-800"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      {missing ? (
        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-amber-200 py-0.5">
          Missing
        </span>
      ) : null}
    </div>
  )
}
