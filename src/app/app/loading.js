export default function AppLoading() {
  return (
    <div className="flex flex-col gap-5 py-4 animate-fadeIn">
      {/* Greeting */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-7 w-40 rounded-lg shimmer-loading" />
          <div className="h-4 w-32 rounded-lg shimmer-loading" />
        </div>
      </div>

      {/* WeatherWidget Skeleton */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        {/* Location + Refresh */}
        <div className="flex justify-between items-center">
          <div className="h-3.5 w-32 rounded-md shimmer-loading" />
          <div className="h-4 w-4 rounded-md shimmer-loading" />
        </div>
        {/* Temp + stats */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl shimmer-loading shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-7 w-12 rounded shimmer-loading" />
            <div className="h-3.5 w-16 rounded shimmer-loading" />
          </div>
          <div className="w-px h-8 bg-[var(--theme-glass-border)] mx-1" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex justify-between">
              <div className="h-2.5 w-8 rounded bg-[var(--theme-border)] opacity-60" />
              <div className="h-2.5 w-6 rounded bg-[var(--theme-border)] opacity-60" />
            </div>
            <div className="flex justify-between">
              <div className="h-2.5 w-10 rounded bg-[var(--theme-border)] opacity-60" />
              <div className="h-2.5 w-5 rounded bg-[var(--theme-border)] opacity-60" />
            </div>
            <div className="flex justify-between">
              <div className="h-2.5 w-8 rounded bg-[var(--theme-border)] opacity-60" />
              <div className="h-2.5 w-7 rounded bg-[var(--theme-border)] opacity-60" />
            </div>
          </div>
        </div>
        {/* Bottom suggestion CTA */}
        <div className="h-9 rounded-xl shimmer-loading w-full" />
      </div>

      {/* WardrobeStatsCard Skeleton */}
      <div className="glass rounded-2xl px-4 py-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-24 rounded shimmer-loading" />
            <div className="h-4 w-12 rounded-full shimmer-loading" />
          </div>
          <div className="h-3.5 w-3.5 rounded shimmer-loading" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[12, 10, 14].map((w, idx) => (
              <div key={idx} className="h-6 rounded-lg shimmer-loading" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
          <div className="flex gap-1 shrink-0">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="w-6 h-6 rounded-lg shimmer-loading" />
            ))}
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div className="relative group flex items-center gap-4 p-[1px] rounded-2xl bg-gradient-to-r from-app-primary via-brand-secondary to-app-accent overflow-hidden">
        <div className="flex items-center gap-4 w-full glass rounded-[15px] px-5 py-4 shimmer-loading">
          <div className="w-5 h-5 rounded-md bg-[var(--theme-border)]" />
          <div className="h-4 w-32 rounded-md bg-[var(--theme-border)]" />
          <div className="ml-auto w-4 h-4 rounded-md bg-[var(--theme-border)]" />
        </div>
      </div>

      {/* Genera Outfit CTA */}
      <div className="glass rounded-2xl flex items-center gap-4 px-5 py-4 shimmer-loading bg-[var(--theme-glass-highlight)]">
        <div className="w-5 h-5 rounded-md bg-[var(--theme-border)] animate-pulse" />
        <div className="h-4 w-28 rounded-md bg-[var(--theme-border)]" />
        <div className="ml-auto w-4 h-4 rounded-md bg-[var(--theme-border)]" />
      </div>

      {/* Últimes peces */}
      <div className="mt-1">
        <div className="h-5 w-24 rounded-lg shimmer-loading mb-3" />
        <div className="flex overflow-hidden gap-3 pb-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-28 relative rounded-[18px] overflow-hidden glass shimmer-loading">
              <div className="aspect-[3/4] relative">
                <div className="h-3.5 w-14 rounded bg-[var(--theme-border)] opacity-50 absolute bottom-2.5 left-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
