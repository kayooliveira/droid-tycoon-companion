import { cn } from '../lib/utils'

/** Same artwork as favicon / PWA (`public/pwa-192.png`). */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/pwa-192.png"
      alt=""
      width={32}
      height={32}
      decoding="async"
      className={cn('h-8 w-8 shrink-0 rounded-[9px] object-cover flex-none', className)}
    />
  )
}
