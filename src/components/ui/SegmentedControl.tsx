import { cn } from '../../lib/utils'

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  compact,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string; icon?: React.ReactNode }>
  ariaLabel: string
  className?: string
  compact?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('dc-segmented', compact && 'dc-inv-seg', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn('dc-seg', active && 'dc-seg-on')}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
