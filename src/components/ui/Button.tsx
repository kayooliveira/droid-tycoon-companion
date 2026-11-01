import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-holo-600 hover:bg-holo-500 text-white shadow-lg shadow-holo-900/30 border border-holo-400/20',
  secondary: 'bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-100',
  ghost: 'hover:bg-white/10 text-zinc-200',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs gap-1.5',
  md: 'min-h-11 px-4 py-2.5 text-sm gap-2',
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
  return (
    <button
      aria-label={iconOnly ? ariaLabel : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0',
        variants[variant],
        iconOnly || size === 'icon' ? sizes.icon : sizes[size],
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0 [&_svg]:size-[18px]">{icon}</span> : null}
      {!iconOnly && size !== 'icon' ? children : null}
      {iconOnly && children}
    </button>
  )
}
