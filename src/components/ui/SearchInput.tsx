import { MagnifyingGlass, X } from '@phosphor-icons/react'
import type { InputHTMLAttributes } from 'react'
import { uiIconProps } from './iconStyle'
import { cn } from '../../lib/utils'

export function SearchInput({
  className,
  onClear,
  value,
  clearLabel,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  onClear?: () => void
  clearLabel?: string
}) {
  const showClear = onClear && value && String(value).length > 0
  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlass
        {...uiIconProps}
        className="pointer-events-none absolute left-[var(--space-3)] top-1/2 size-[var(--ds-search-icon-size)] -translate-y-1/2 text-ui-muted"
        aria-hidden
      />
      <input
        type="search"
        enterKeyHint="search"
        className={cn('ds-search-field', showClear ? 'pr-10' : undefined)}
        value={value}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={onClear}
          className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ui-muted hover:bg-ui-hover hover:text-ui-fg"
        >
          <X {...uiIconProps} className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
