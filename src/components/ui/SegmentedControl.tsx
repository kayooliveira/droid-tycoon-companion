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
      className="flex rounded-xl border border-ui bg-ui-sunken p-1 gap-0.5"
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
              active ? 'bg-ui-hover-strong text-ui-fg shadow-sm' : 'text-ui-muted hover:text-ui-fg',
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
