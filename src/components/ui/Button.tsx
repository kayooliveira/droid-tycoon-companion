import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'accentSoft'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary: 'btn btn--primary',
  accent: 'btn btn--primary',
  accentSoft: 'btn btn--secondary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger-solid',
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
  return (
    <button
      aria-label={iconOnly ? ariaLabel : undefined}
      className={cn(
        variants[variant],
        (iconOnly || size === 'icon') && 'btn--icon',
        size === 'sm' && 'btn--sm',
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0 [&_svg]:size-[22px]">{icon}</span> : null}
      {!iconOnly && size !== 'icon' ? (
        <span className="truncate min-w-0">{children}</span>
      ) : null}
      {iconOnly && children}
    </button>
  )
}
