import { Check } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { uiIconProps } from './iconStyle'

export function RadioCardGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  columns = 2,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string; hint?: string }>
  ariaLabel: string
  columns?: 2 | 3
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('grid gap-2', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative rounded-xl border px-3 py-3 text-left min-h-11 transition-colors',
              selected
                ? 'border-holo-400/50 bg-holo-600/15 ring-1 ring-holo-400/30'
                : 'border-white/10 hover:bg-white/5',
            )}
          >
            {selected ? (
              <Check {...uiIconProps} className="absolute top-2 right-2 text-holo-300" />
            ) : null}
            <p className="font-medium text-sm text-pretty pr-6">{opt.label}</p>
            {opt.hint ? <p className="text-[11px] text-zinc-500 mt-0.5 text-pretty">{opt.hint}</p> : null}
          </button>
        )
      })}
    </div>
  )
}
