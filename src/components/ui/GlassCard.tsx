import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function GlassCard({
  children,
  className,
  as: Tag = 'div',
  ...rest
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'div' | 'section' | 'article'
}) {
  return (
    <Tag className={cn('panel', className)} {...rest}>
      {children}
    </Tag>
  )
}
