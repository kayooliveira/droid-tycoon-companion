import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className,
  testId,
}: {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
  testId?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'flex w-full min-h-11 items-center gap-3 rounded-xl border border-ui-subtle bg-ui-raised/80 px-3 py-2.5 text-left motion-standard transition-colors',
        onClick && 'hover:bg-ui-hover active:scale-[0.99]',
        className,
      )}
    >
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-ds-sm font-medium text-ui-fg truncate">{title}</span>
        {subtitle ? (
          <span className="block text-ds-xs text-ui-muted truncate">{subtitle}</span>
        ) : null}
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </Tag>
  )
}
