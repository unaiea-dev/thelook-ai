export default function ArmariLoading() {
  return (
    <div className="flex flex-col gap-5 py-4 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 rounded-lg shimmer-loading" />
        <div className="glass rounded-full px-3 py-1 h-7 w-14 shimmer-loading" />
      </div>

      {/* Filter chips */}
      <div className="flex overflow-hidden gap-2">
        {[18, 22, 16, 20, 14, 18].map((w, i) => (
          <div key={i} className={`shrink-0 h-8 rounded-full shimmer-loading`} style={{ width: `${w * 4}px` }} />
        ))}
      </div>

      {/* Garment grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            <div className="aspect-[3/4] shimmer-loading" />
            <div className="p-2.5 flex flex-col gap-1.5">
              <div className="h-3.5 w-16 rounded shimmer-loading" />
              <div className="h-3 w-10 rounded shimmer-loading" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
