import { GlassCard } from './ui/GlassCard'

export function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-lg bg-white/10" />
      <GlassCard className="space-y-3">
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-24 w-full rounded-xl bg-white/5" />
      </GlassCard>
    </div>
  )
}
