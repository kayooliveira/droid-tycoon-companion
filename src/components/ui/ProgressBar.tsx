import { cn } from '../../lib/utils'

export function ProgressBar({
  value,
  className,
  label,
}: {
  value: number
  className?: string
  label?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('space-y-1', className)}>
      {label ? (
        <div className="flex justify-between text-xs text-zinc-400">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-holo-600 via-accent-cyan to-holo-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
