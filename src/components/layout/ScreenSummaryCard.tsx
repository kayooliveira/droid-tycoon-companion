import type { ReactNode } from 'react'
import { InsetGroup } from '../ui/InsetGroup'

export function ScreenSummaryCard({
  children,
  testId,
}: {
  children: ReactNode
  testId?: string
}) {
  return (
    <InsetGroup testId={testId}>
      <div className="panel">{children}</div>
    </InsetGroup>
  )
}
