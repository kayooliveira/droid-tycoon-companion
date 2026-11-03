import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function ScrollPage({
  title,
  testId,
  children,
  className,
  headerExtra,
}: {
  title: string
  testId: string
  children: ReactNode
  className?: string
  headerExtra?: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 36)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn('scroll-page -mx-4 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain', className)}
      data-testid={testId}
    >
      <div
        className={cn(
          'scroll-page-inline sticky top-0 z-sticky flex h-0 items-center justify-center border-b border-transparent bg-ui-bg/80 opacity-0 backdrop-blur-xl transition-all duration-200',
          scrolled && 'scroll-page-inline--visible h-11 opacity-100 border-ui-subtle',
        )}
        aria-hidden={!scrolled}
      >
        <span className="text-ds-base font-semibold text-ui-fg">{title}</span>
      </div>
      <div className="px-4 pb-4 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <div className={cn('flex items-start justify-between gap-3', scrolled && 'scroll-page-title--hidden')}>
          <h1 className="scroll-page-title text-[2.125rem] font-bold leading-[2.5625rem] tracking-[-0.02em] text-ui-fg">
            {title}
          </h1>
          {headerExtra ? <div className="shrink-0 pt-1">{headerExtra}</div> : null}
        </div>
        <div className="mt-4 space-y-5">{children}</div>
      </div>
    </div>
  )
}
