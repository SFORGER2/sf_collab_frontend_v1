
export default function StartupDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Nav bar skeleton */}
      <nav className="w-full h-12 bg-gray-800/60 border-b border-gray-700/50 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <div className="h-4 w-28 bg-gray-700 rounded" />
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-3 w-3 bg-gray-700 rounded" />
          <div className="h-3 w-3 bg-gray-700 rounded" />
          <div className="h-3 w-32 bg-gray-700 rounded" />
        </div>
        <div className="ml-auto flex gap-2">
          <div className="h-8 w-24 bg-gray-700 rounded-lg" />
          <div className="h-8 w-24 bg-gray-700 rounded-lg" />
        </div>
      </nav>

      {/* Hero banner */}
      <div className="h-64 w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />

      {/* Hero content area (logo + info + action buttons) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-20 relative z-10 gap-4">
          {/* Logo + startup info */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-900 shrink-0" />
            <div className="space-y-3 pb-2">
              <div className="h-8 w-52 bg-gray-700 rounded-xl" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-24 bg-gray-700 rounded-full" />
                <div className="h-6 w-20 bg-gray-700 rounded-full" />
                <div className="h-6 w-20 bg-gray-700 rounded-full" />
              </div>
              <div className="h-4 w-80 bg-gray-700/70 rounded" />
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-3">
            <div className="h-9 w-28 bg-blue-700/40 rounded-lg" />
            <div className="h-9 w-20 bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs bar */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-800/50 rounded-xl mb-8 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-9 rounded-lg shrink-0 ${i === 0 ? 'w-28 bg-blue-600/50' : 'w-24 bg-gray-700/60'}`}
            />
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 bg-gray-800 rounded-xl border border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gray-700 rounded-xl" />
                <div className="h-6 w-14 bg-gray-700 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-7 w-12 bg-gray-700 rounded" />
                <div className="h-2 w-full bg-gray-700 rounded-full" />
                <div className="h-3 w-24 bg-gray-700/70 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Content blocks */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-800 rounded-xl border border-gray-700 space-y-4">
              <div className="h-5 bg-gray-700 rounded w-1/3" />
              <div className="space-y-2.5">
                <div className="h-4 bg-gray-700 rounded" />
                <div className="h-4 bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-700 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}