import { MagnifyingGlass, X } from '@phosphor-icons/react'
import type { InputHTMLAttributes } from 'react'
import { uiIconProps } from './iconStyle'
import { cn } from '../../lib/utils'

export function SearchInput({
  className,
  onClear,
  value,
  clearLabel,
  clearTestId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  onClear?: () => void
  clearLabel?: string
  clearTestId?: string
}) {
  const showClear = Boolean(onClear && value != null && String(value).length > 0)
  return (
    <div className={cn('field-wrap', showClear ? 'field-wrap--clear' : undefined, className)}>
      <MagnifyingGlass {...uiIconProps} width={20} height={20} className="ic" aria-hidden />
      <input
        type="search"
        enterKeyHint="search"
        className="field"
        value={value}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          data-testid={clearTestId}
          onClick={onClear}
          className="field-clear"
        >
          <X {...uiIconProps} width={18} height={18} className="ic" />
        </button>
      ) : null}
    </div>
  )
}
