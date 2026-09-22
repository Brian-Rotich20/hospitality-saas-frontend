// app/(public)/store/loading.tsx
// Next.js wraps StorePage in a Suspense boundary automatically and shows
// this while the async Server Component fetches — this replaces the old
// client-side CardSkeleton/SidebarSkeleton/GridSkeleton loading-state
// juggling in StoreContent entirely. No hooks, no client code needed.

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-36 skeleton rounded-none" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="h-3 skeleton w-1/3" />
        <div className="pt-2 border-t border-border flex justify-between">
          <div className="h-5 skeleton w-16" />
          <div className="h-6 skeleton w-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <div className="w-10 h-10 skeleton shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 skeleton w-24" />
            <div className="h-2.5 skeleton w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StoreLoading() {
  const headerH = 'var(--header-h, 116px)';
  return (
    <div className="min-h-screen bg-page">
      <div className="flex max-w-screen-xl mx-auto">
        <aside className="hidden lg:block w-56 xl:w-64 shrink-0 bg-card border-r border-border sticky self-start"
          style={{ top: headerH, height: `calc(100vh - ${headerH})` }}>
          <SidebarSkeleton />
        </aside>
        <main className="flex-1 min-w-0 px-4 lg:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </main>
      </div>
    </div>
  );
}