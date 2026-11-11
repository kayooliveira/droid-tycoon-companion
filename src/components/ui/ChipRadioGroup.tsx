import { useLayoutEffect, useRef } from 'react'
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
  const groupRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!scrollX) return
    const container = groupRef.current
    if (!container) return
    const active = container.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!active) return
    container.scrollLeft = Math.max(0, active.offsetLeft - 24)
  }, [scrollX, value])

  return (
    <div
      ref={groupRef}
      role="radiogroup"
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
