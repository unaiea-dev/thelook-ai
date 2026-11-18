export default function BlogLoading() {
  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-12 w-64 bg-[var(--theme-glass-bg)] rounded-2xl animate-pulse mb-4" />
          <div className="h-5 w-96 max-w-full bg-[var(--theme-glass-bg)] rounded-xl animate-pulse" />
        </div>

        {/* Category filter skeleton */}
        <div className="flex gap-2 mb-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-full bg-[var(--theme-glass-bg)] animate-pulse" style={{ width: `${80 + i * 20}px` }} />
          ))}
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <div className="h-48 bg-[var(--theme-glass-bg)] animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-[var(--theme-glass-bg)] rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-[var(--theme-glass-bg)] rounded-lg animate-pulse" />
                <div className="h-4 w-5/6 bg-[var(--theme-glass-bg)] rounded-lg animate-pulse" />
                <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border)] mt-4">
                  <div className="h-3 w-24 bg-[var(--theme-glass-bg)] rounded animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-[var(--theme-glass-bg)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
