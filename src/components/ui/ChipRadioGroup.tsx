import { cn } from '../../lib/utils'

export function ChipRadioGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  testId,
  scrollX,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
  ariaLabel: string
  testId?: string
  scrollX?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        'flex w-full min-w-0 max-w-full gap-2',
        scrollX
          ? 'overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory scrollbar-thin'
          : 'flex-wrap',
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={testId ? `${testId}-${opt.value}` : undefined}
            className={cn(
              'rounded-full px-3 py-2 text-base min-h-11 border font-medium shrink-0 snap-start whitespace-nowrap',
              active ? 'ui-chip-active' : 'border-ui bg-ui-hover text-ui-muted hover:text-ui-fg',
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
