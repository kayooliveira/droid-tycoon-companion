import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warn' | 'danger' | 'info'
  className?: string
}) {
  const tones = {
    default: 'ui-badge ui-badge-default',
    success: 'ui-badge ui-badge-success',
    warn: 'ui-badge ui-badge-warn',
    danger: 'ui-badge ui-badge-danger',
    info: 'ui-badge ui-badge-info',
  }
  return <span className={cn(tones[tone], className)}>{children}</span>
}
