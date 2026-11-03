import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function PageScreen({
  testId,
  children,
  className,
}: {
  testId: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('deck-page space-y-5 pb-6 md:pb-8', className)} data-testid={testId}>
      {children}
    </div>
  )
}
