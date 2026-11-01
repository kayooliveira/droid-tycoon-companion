import { cn } from '../lib/utils'

/** Same artwork as favicon / PWA (`public/pwa-192.png`). */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/pwa-192.png"
      srcSet="/pwa-192.png 192w, /pwa-512.png 512w"
      sizes="32px"
      alt=""
      width={32}
      height={32}
      decoding="async"
      className={cn('h-8 w-8 shrink-0 rounded-[10px] object-cover flex-none', className)}
    />
  )
}
