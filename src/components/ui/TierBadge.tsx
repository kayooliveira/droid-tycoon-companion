import type { ReactNode } from 'react'
import type { TierId } from '../../domain/types'
import { cn } from '../../lib/utils'
import { tierBadgeClass } from './tierVisuals'

export function TierBadge({
  tier,
  children,
  className,
  testId,
}: {
  tier: TierId
  children: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <span
      className={cn('tier-badge', tierBadgeClass(tier), className)}
      data-testid={testId}
    >
      <span className="tier-badge__text">{children}</span>
    </span>
  )
}
