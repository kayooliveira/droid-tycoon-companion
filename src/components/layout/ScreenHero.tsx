import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function ScreenHero({
  kicker,
  title,
  description,
  action,
  className,
}: {
  kicker?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('deck-mobile-intro md:mb-2 space-y-1', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {kicker ? (
            <p className="text-ds-xs font-display uppercase tracking-[0.18em] text-ui-accent">
              {kicker}
            </p>
          ) : null}
          <h1 className="text-ds-display-sm text-ui-fg text-balance md:hidden">{title}</h1>
          <h1 className="hidden md:block text-ds-display-md text-ui-fg text-balance">{title}</h1>
          {description ? (
            <p className="text-ds-sm text-ui-muted text-pretty mt-1 max-w-prose">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
