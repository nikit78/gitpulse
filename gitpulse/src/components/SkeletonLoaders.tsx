export function UserProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-6 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-32 bg-white/10 rounded-lg" />
          <div className="h-4 w-full max-w-sm bg-white/10 rounded-lg" />
          <div className="flex gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white/5 border border-white/10" />
        ))}
      </div>
    </div>
  );
}

export function RepoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-36 rounded-xl bg-white/5 border border-white/10" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-72 rounded-xl bg-white/5 border border-white/10" />
    </div>
  );
}
