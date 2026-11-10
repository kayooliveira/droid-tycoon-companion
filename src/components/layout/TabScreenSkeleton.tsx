import { Skeleton } from '../ui/Skeleton'

export function TabScreenSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="stack -mx-4 min-h-0 flex-1 md:mx-0" aria-busy="true" aria-label="Loading">
      <Skeleton className="mx-4 mt-2 h-[41px] w-[55%]" rounded="md" />
      <div className="stack mt-[var(--space-2)]">
        <div className="inset-group mx-4">
          <div className="inset-group__body space-y-0">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <Skeleton className="h-11 w-11 shrink-0" rounded="md" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="mx-4 h-11 w-full" rounded="lg" />
        <div className="inset-group mx-4">
          <div className="inset-group__body">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <Skeleton className="h-[50px] w-[50px] shrink-0" rounded="md" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
