import type { HTMLAttributes, ReactNode } from 'react'
import type { TierId } from '../../domain/types'
import { cn } from '../../lib/utils'
import { tierSurfaceClass } from './tierVisuals'

export function TierSurface({
  tier,
  title,
  children,
  className,
  testId,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  tier: TierId
  title: ReactNode
  children?: ReactNode
  testId?: string
}) {
  return (
    <div
      className={cn('tier-surface', tierSurfaceClass(tier), className)}
      data-testid={testId}
      {...rest}
    >
      <p className="tier-surface__label">{title}</p>
      {children ? <div className="tier-surface__body">{children}</div> : null}
    </div>
  )
}
