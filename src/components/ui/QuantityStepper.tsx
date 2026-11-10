import { cn } from '../../lib/utils'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  label,
  decreaseLabel,
  increaseLabel,
  className,
  testId,
  compact,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  label?: string
  decreaseLabel: string
  increaseLabel: string
  className?: string
  testId?: string
  compact?: boolean
}) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  return (
    <div className={cn(compact ? '' : 'stack', className)}>
      {label ? <span className="t-label">{label}</span> : null}
      <div className="stepper" data-testid={testId}>
        <button
          type="button"
          className="btn btn--icon btn--secondary"
          aria-label={decreaseLabel}
          data-testid={testId ? `${testId}-dec` : undefined}
          onClick={dec}
          disabled={value <= min}
        >
          −
        </button>
        <span
          className="stepper-val"
          data-testid={testId ? `${testId}-value` : undefined}
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          className="btn btn--icon btn--primary"
          aria-label={increaseLabel}
          data-testid={testId ? `${testId}-inc` : undefined}
          onClick={inc}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  )
}
