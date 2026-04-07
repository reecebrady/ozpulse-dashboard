export default function Home() {
  return (
    <div className="flex h-screen w-screen">
      {/* Left Sidebar - Layer Toggles */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border bg-card p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Layers</h2>
        <p className="text-muted-foreground text-sm">Layer toggles will appear here.</p>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar - Profile Stats */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-6">
          <span className="font-semibold text-primary">OzPulse</span>
          <span className="text-sm text-muted-foreground">Mortgage: --</span>
          <span className="text-sm text-muted-foreground">Fuel: --/wk</span>
          <span className="text-sm text-muted-foreground">Risk: --</span>
        </header>

        {/* Map Area */}
        <div className="flex-1 relative bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Map loading...</p>
        </div>

        {/* Bottom Alert Feed */}
        <footer className="h-24 border-t border-border bg-card p-3 overflow-y-auto">
          <p className="text-sm text-muted-foreground">No alerts yet.</p>
        </footer>
      </main>

      {/* Right Panel - Detail Charts */}
      <aside className="hidden lg:flex w-80 flex-col border-l border-border bg-card p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Details</h2>
        <p className="text-muted-foreground text-sm">Click a map element to see details.</p>
      </aside>
    </div>
  );
}
