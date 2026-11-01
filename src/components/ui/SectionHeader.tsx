import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function SectionHeader({
  icon,
  title,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2 mb-3', className)}>
      <div className="flex items-center gap-2 min-w-0">
        {icon ? <span className="text-holo-300 shrink-0 [&_svg]:size-[18px]">{icon}</span> : null}
        <h2 className="font-medium text-sm text-zinc-100 theme-heading text-balance truncate">{title}</h2>
      </div>
      {action}
    </div>
  )
}
