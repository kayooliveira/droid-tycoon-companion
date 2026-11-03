import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** Solid content surface (not glass). Glass is reserved for chrome layers. */
export function GlassCard({
  children,
  className,
  as: Tag = 'div',
  ...rest
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn('surface-card deck-panel p-4 md:p-5', className)} {...rest}>
      {children}
    </Tag>
  )
}
