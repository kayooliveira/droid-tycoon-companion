import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warn' | 'danger' | 'info'
  className?: string
}) {
  const tones = {
    default: 'bg-white/10 text-zinc-200 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
    warn: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
    danger: 'bg-red-500/15 text-red-200 border-red-400/20',
    info: 'bg-holo-500/15 text-holo-200 border-holo-400/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
