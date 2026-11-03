import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  ghost: 'ui-btn-ghost hover:bg-ui-hover',
  soft: 'bg-ui-sunken hover:bg-ui-hover text-ui-fg',
  solid: 'text-[var(--ui-accent-on-filled)] hover:opacity-90',
} as const

export function IconButton({
  children,
  label,
  variant = 'ghost',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  label: string
  variant?: keyof typeof variants
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors',
        variant === 'solid' && 'bg-[var(--ui-accent-fill)]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
