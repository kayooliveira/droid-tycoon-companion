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
  const showClear = onClear && value && String(value).length > 0
  return (
    <div className={cn('field-wrap', className)}>
      <MagnifyingGlass {...uiIconProps} width={20} height={20} className="ic" aria-hidden />
      <input
        type="search"
        enterKeyHint="search"
        className={cn('field', showClear && 'pr-10')}
        value={value}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          data-testid={clearTestId}
          onClick={onClear}
          className="btn btn--icon btn--secondary"
          style={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 36,
            height: 36,
            minHeight: 36,
          }}
        >
          <X {...uiIconProps} width={18} height={18} className="ic" />
        </button>
      ) : null}
    </div>
  )
}
