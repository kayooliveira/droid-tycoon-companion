import type { ReactNode } from 'react'
import type { TierId } from '../../domain/types'
import { cn } from '../../lib/utils'
import { tierSurfaceClass } from './tierVisuals'

export function DroidWell({
  tier,
  children,
  className,
  size = 'row',
}: {
  tier: TierId
  children: ReactNode
  className?: string
  size?: 'row' | 'hero' | 'collect' | 'sheet'
}) {
  return (
    <div
      className={cn(
        'droid-well',
        tierSurfaceClass(tier),
        size === 'row' && 'droid-well--row',
        size === 'hero' && 'droid-well--hero',
        size === 'collect' && 'droid-well--collect',
        size === 'sheet' && 'droid-well--sheet',
        className,
      )}
    >
      {children}
    </div>
  )
}
