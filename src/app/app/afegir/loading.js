export default function AfegirLoading() {
  return (
    <div className="flex flex-col h-full flex-1 relative animate-fadeIn">
      {/* Camera viewfinder skeleton */}
      <div className="flex-1 rounded-[20px] overflow-hidden relative shimmer-loading min-h-[65vh]">
        {/* Corner brackets */}
        <div className="absolute inset-8 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--theme-border)] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--theme-border)] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--theme-border)] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--theme-border)] rounded-br-lg" />
        </div>

        {/* Hint text */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <div className="h-3 w-44 rounded shimmer-loading" />
        </div>

        {/* Camera controls */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-10 z-20">
          <div className="w-10 h-10 rounded-full glass" />
          <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[var(--theme-border)] p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full shimmer-loading" />
          </div>
          <div className="w-10 h-10 invisible" />
        </div>
      </div>
    </div>
  )
}
