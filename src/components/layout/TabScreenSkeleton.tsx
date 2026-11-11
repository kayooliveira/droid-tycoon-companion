export function TabScreenSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading">
      <div className="skeleton-block" style={{ height: 41, width: '55%', borderRadius: 12 }} />
      <div className="inset-group">
        <div className="inset-group__body">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="row">
              <span className="skeleton-block" style={{ width: 44, height: 44, borderRadius: 12, flex: 'none' }} />
              <span className="row-main">
                <span className="skeleton-block" style={{ display: 'block', height: 14, width: '70%' }} />
                <span
                  className="skeleton-block"
                  style={{ display: 'block', height: 12, width: '45%', marginTop: 6 }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
