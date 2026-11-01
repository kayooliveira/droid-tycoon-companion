import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

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
    <Tag className={cn('glass-panel rounded-[var(--radius-glass)] p-4 md:p-5', className)} {...rest}>
      {children}
    </Tag>
  )
}
