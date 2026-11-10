import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function ScreenSection({
  children,
  className,
  testId,
}: {
  children: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <section className={cn('sec', className)} data-testid={testId}>
      {children}
    </section>
  )
}
