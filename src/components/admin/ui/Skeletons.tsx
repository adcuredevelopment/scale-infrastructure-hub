export function KPISkeleton() {
  return (
    <div className="admin-card p-4 h-[100px] animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-2 w-20 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-7 w-7 rounded-md" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
      <div className="h-6 w-32 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-3 p-3 rounded-md animate-pulse"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ))}
    </div>
  );
}
