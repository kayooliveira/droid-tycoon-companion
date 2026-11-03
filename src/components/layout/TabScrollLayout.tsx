import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function TabScrollLayout({
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

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onScroll = () => {
      el.classList.toggle('scrolled', el.scrollTop > 36)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn('dc-scroll-view -mx-4 min-h-0 flex-1 md:mx-0', className)}
      data-testid={testId}
    >
      <div className="dc-inline-title-bar" aria-hidden>
        <span className="dc-inline-title">{title}</span>
      </div>
      <div className="flex items-start justify-between gap-3 px-0">
        <h1 className="dc-large-title flex-1">{title}</h1>
        {headerExtra ? <div className="shrink-0 pr-4 pt-2">{headerExtra}</div> : null}
      </div>
      {children}
    </div>
  )
}
