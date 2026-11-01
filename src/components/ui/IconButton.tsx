import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'ghost' | 'soft' | 'solid'

const variants: Record<Variant, string> = {
  ghost: 'hover:bg-white/10 text-zinc-300',
  soft: 'bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-100',
  solid: 'bg-holo-600 hover:bg-holo-500 text-white',
}

export function IconButton({
  label,
  children,
  className,
  variant = 'ghost',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
  variant?: Variant
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'min-h-11 min-w-11' : 'min-h-10 min-w-10'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-50',
        dim,
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
