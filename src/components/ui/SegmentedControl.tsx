import { cn } from '../../lib/utils'

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string; icon?: React.ReactNode }>
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="ui-segment-track flex rounded-xl border border-ui p-1 gap-0.5"
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
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-base font-medium whitespace-nowrap min-h-11 transition-colors',
              active
                ? 'ui-segment-active shadow-elevation-1'
                : 'hover:text-ui-fg hover:bg-ui-hover',
            )}
          >
            {opt.icon}
            <span className="text-pretty">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
