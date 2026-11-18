import ThemeToggle from '@/components/ThemeToggle'

export default function PerfilLoading() {
  return (
    <div className="flex flex-col gap-5 py-4 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-20 rounded-lg shimmer-loading" />
        <div className="w-8 h-8 rounded-full shimmer-loading shrink-0" />
      </div>

      {/* Avatar Card */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ animationFillMode: 'both' }}>
        <div className="absolute top-0 w-full h-20 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 pointer-events-none" />
        
        <div className="relative z-10 mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-app-bg shimmer-loading" />
        </div>
        
        <div className="mb-3 z-10 relative">
          <div className="w-12 h-5 rounded-full shimmer-loading" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-2 w-full">
          <div className="h-6 w-32 rounded-lg shimmer-loading mb-1" />
          <div className="h-3 w-48 rounded-lg shimmer-loading" />
        </div>
      </div>

      {/* Stats */}
      <div className="h-5 w-28 rounded-lg shimmer-loading mt-1" />
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg shimmer-loading mb-1" />
            <div className="w-8 h-6 rounded-lg shimmer-loading" />
            <div className="w-16 h-2.5 rounded-lg shimmer-loading" />
          </div>
        ))}
      </div>

      {/* Plan Progress */}
      <div className="h-5 w-24 rounded-lg shimmer-loading mt-1" />
      <div className="glass rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <div className="flex justify-between mb-2">
            <div className="h-3.5 w-24 rounded-md shimmer-loading" />
            <div className="h-3.5 w-10 rounded-md shimmer-loading" />
          </div>
          <div className="w-full rounded-full h-1.5 shimmer-loading" />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <div className="h-3.5 w-36 rounded-md shimmer-loading" />
            <div className="h-3.5 w-10 rounded-md shimmer-loading" />
          </div>
          <div className="w-full rounded-full h-1.5 shimmer-loading" />
        </div>
        <div className="mt-1 w-full h-11 rounded-xl shimmer-loading" />
      </div>

      {/* Account */}
      <div className="h-5 w-20 rounded-lg shimmer-loading mt-1" />
      <div className="glass rounded-2xl p-1.5">
        <div className="w-full flex items-center gap-3 p-3.5 rounded-xl">
          <div className="w-9 h-9 rounded-full shimmer-loading shrink-0" />
          <div className="h-4 w-28 rounded-lg shimmer-loading" />
        </div>
      </div>
    </div>
  )
}
