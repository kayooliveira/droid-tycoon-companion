import { cn } from '../../lib/utils'

export function Skeleton({
  className,
  testId,
}: {
  className?: string
  testId?: string
}) {
  return (
    <div
      data-testid={testId ?? 'skeleton-block'}
      className={cn('animate-pulse rounded-lg bg-ui-hover-strong', className)}
      aria-hidden
    />
  )
}

export function SkeletonStack({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" data-testid="skeleton-stack">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}
