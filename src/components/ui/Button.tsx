import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-holo-600 hover:bg-holo-500 text-white shadow-lg shadow-holo-900/30 border border-holo-400/20',
  secondary:
    'bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-100',
  ghost: 'hover:bg-white/10 text-zinc-200',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
}

export function Button({
  children,
  className,
  variant = 'primary',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: Variant
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
