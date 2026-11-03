import type { ElementType, HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function GlassCard({
  as,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: ElementType }) {
  const Tag = as ?? 'div'
  return (
    <Tag className={cn('inset-group', className)} {...rest}>
      {children}
    </Tag>
  )
}
