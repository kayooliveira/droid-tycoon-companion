<cursor_untrusted_data_1337 source="CallDynamicTool">

import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function EmptyState({
  title,
  description,
  action,
  className,
  testId = 'empty-state',
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ui px-6 py-10 text-center',
        className,
      )}
    >
      <p className="text-ds-lg font-semibold text-ui-fg text-balance">{title}</p>
      {description ? (
        <p className="text-ds-sm text-ui-muted max-w-sm text-pretty">{description}</p>
      ) : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}


</cursor_untrusted_data_1337>