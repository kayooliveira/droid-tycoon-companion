import { cn } from '../../lib/utils'

export function ChipRadioGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  testId,
  scrollX,
  grid,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
  ariaLabel: string
  testId?: string
  scrollX?: boolean
  grid?: boolean
}) {
  return (
    <div
      role={grid ? 'group' : 'radiogroup'}
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        'chips',
        scrollX && 'chips--scroll',
        grid && 'chips--grid',
        !scrollX && !grid && 'flex-wrap',
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
            className="chip"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
