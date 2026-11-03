import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function InsetGroup({
  children,
  footer,
  className,
  testId,
}: {
  children: ReactNode
  footer?: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <div className={cn('inset-group', className)} data-testid={testId}>
      <div className="inset-group__body">{children}</div>
      {footer ? <p className="inset-group__footer">{footer}</p> : null}
    </div>
  )
}
