import { cn } from '../../lib/utils'

export function Skeleton({
  className,
  rounded = 'md',
}: {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}) {
  const radius = {
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
    full: 'rounded-full',
  }[rounded]
  return (
    <div
      className={cn('skeleton-block', radius, className)}
      aria-hidden
    />
  )
}
