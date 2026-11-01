import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type GlassVariant = 'regular' | 'clear' | 'tinted'

type GlassProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  variant?: GlassVariant
  interactive?: boolean
  children?: ReactNode
}

export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
  { as, variant = 'regular', interactive = false, className, children, ...props },
  ref,
) {
  const Tag = as ?? 'div'
  return (
    <Tag
      ref={ref as never}
      className={cn(
        'glass',
        variant === 'regular' && 'glass-regular',
        variant === 'clear' && 'glass-clear',
        variant === 'tinted' && 'glass-tinted',
        interactive && 'glass-interactive',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
})
