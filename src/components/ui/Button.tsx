import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-holo-600 to-cyan-600 hover:from-holo-500 hover:to-cyan-500 text-white shadow-lg shadow-holo-900/25 border border-white/10 disabled:!bg-zinc-700/90 disabled:!from-zinc-700 disabled:!to-zinc-700 disabled:!text-zinc-400/90 disabled:!shadow-none disabled:!border-zinc-600/40',
  accent:
    'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-semibold shadow-lg shadow-amber-900/30 border border-amber-200/20',
  secondary:
    'ui-btn-secondary bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-100 backdrop-blur-md',
  ghost: 'hover:bg-white/10 text-zinc-200',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3.5 py-2 text-xs gap-1.5 rounded-xl',
  md: 'min-h-11 px-4 py-2.5 text-sm gap-2 rounded-xl',
  icon: 'min-h-11 min-w-11 p-0 rounded-xl',
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
        'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100 whitespace-nowrap shrink-0',
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
