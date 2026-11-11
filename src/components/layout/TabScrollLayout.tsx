import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { APP_BRAND_NAME } from '../../lib/brand'

export function TabScrollLayout({
  title,
  testId,
  children,
  className,
  headerExtra,
  backBar,
  hideBrand,
}: {
  title: string
  testId: string
  children: ReactNode
  className?: string
  headerExtra?: ReactNode
  backBar?: ReactNode
  hideBrand?: boolean
}) {
  return (
    <div data-testid={testId} className={cn('tab-page', className)}>
      {backBar}
      <header className="top">
        {!hideBrand ? (
          <span className="top-brand" aria-hidden>
            {APP_BRAND_NAME}
          </span>
        ) : (
          <span className="top-brand" aria-hidden style={{ display: 'none' }} />
        )}
        <div className="top-aside">{headerExtra}</div>
        <h1 className="t-display">{title}</h1>
      </header>
      {children}
    </div>
  )
}
