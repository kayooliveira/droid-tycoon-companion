import { Minus, Plus } from '@phosphor-icons/react'
import { uiIconProps } from './iconStyle'
import { IconButton } from './IconButton'
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
    <div className={cn(compact ? '' : 'space-y-1', className)}>
      {label ? <span className="block text-base text-ui-secondary">{label}</span> : null}
      <div
        data-testid={testId}
        className={cn(
          'flex items-center gap-1 rounded-xl border border-ui bg-ui-field/80',
          compact ? 'p-0.5' : 'p-1',
        )}
      >
        <IconButton
          label={decreaseLabel}
          className={cn('shrink-0', compact ? 'min-h-10 min-w-10' : 'min-h-11 min-w-11')}
          data-testid={testId ? `${testId}-dec` : undefined}
          onClick={dec}
          disabled={value <= min}
        >
          <Minus {...uiIconProps} />
        </IconButton>
        <span
          className={cn(
            'flex-1 text-center font-semibold tabular-nums text-ui-fg',
            compact ? 'text-sm min-w-[2rem]' : 'text-base',
          )}
          data-testid={testId ? `${testId}-value` : undefined}
          aria-live="polite"
        >
          {value}
        </span>
        <IconButton
          label={increaseLabel}
          className={cn('shrink-0', compact ? 'min-h-10 min-w-10' : 'min-h-11 min-w-11')}
          data-testid={testId ? `${testId}-inc` : undefined}
          onClick={inc}
          disabled={value >= max}
        >
          <Plus {...uiIconProps} />
        </IconButton>
      </div>
    </div>
  )
}
