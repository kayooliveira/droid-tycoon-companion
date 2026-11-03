import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { GlassCard } from './GlassCard'

type CardVariant = 'raised' | 'glass'

export function Card({
  children,
  className,
  variant = 'raised',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  variant?: CardVariant
}) {
  if (variant === 'glass') {
    return (
      <GlassCard className={className} {...props}>
        {children}
      </GlassCard>
    )
  }
  return (
    <div
      className={cn('surface-card p-4 shadow-elevation-1', className)}
      {...props}
    >
      {children}
    </div>
  )
}
