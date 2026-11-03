import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary: 'btn-filled',
  accent: 'btn-filled',
  secondary: 'ui-btn-secondary border rounded-xl',
  ghost: 'ui-btn-ghost rounded-xl',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white rounded-xl',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3.5 py-2 text-sm gap-1.5',
  md: 'min-h-11 px-4 py-2.5 text-base gap-2',
  icon: 'min-h-11 min-w-11 p-0',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly,
  'aria-label': ariaLabel,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconOnly?: boolean
}) {
  const isFilled = variant === 'primary' || variant === 'accent'
  return (
    <button
      aria-label={iconOnly ? ariaLabel : undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100 max-w-full min-w-0',
        variants[variant],
        !isFilled && (iconOnly || size === 'icon' ? sizes.icon : sizes[size]),
        isFilled && size === 'sm' && 'text-sm px-3.5 py-2 min-h-11',
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0 [&_svg]:size-[18px]">{icon}</span> : null}
      {!iconOnly && size !== 'icon' ? (
        <span className="truncate min-w-0">{children}</span>
      ) : null}
      {iconOnly && children}
    </button>
  )
}
