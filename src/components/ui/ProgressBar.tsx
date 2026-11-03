import { cn } from '../../lib/utils'

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ui-sunken', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: 'var(--ui-accent-fill)' }}
      />
    </div>
  )
}
