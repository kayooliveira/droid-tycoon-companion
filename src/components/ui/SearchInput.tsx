import { X } from '@phosphor-icons/react'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { IcSearch } from '../inventoryIcons'
import { uiIconProps } from './iconStyle'
import { cn } from '../../lib/utils'

export const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    onClear?: () => void
    clearLabel?: string
    clearTestId?: string
    inputClassName?: string
  }
>(function SearchInput(
  { className, inputClassName, onClear, value, clearLabel, clearTestId, ...props },
  ref,
) {
  const showClear = Boolean(onClear && value != null && String(value).length > 0)
  return (
    <div className={cn('field-wrap', showClear ? 'field-wrap--clear' : undefined, className)}>
      <IcSearch />
      <input
        ref={ref}
        type="search"
        enterKeyHint="search"
        className={cn('field', inputClassName)}
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
})
