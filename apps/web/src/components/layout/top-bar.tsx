"use client";

export function TopBar() {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-bold tracking-tight">OzPulse</h1>
        <span className="text-xs text-muted-foreground">Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Mortgage Health Widget */}
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
          <span className="text-xs text-muted-foreground">Equity</span>
          <span className="text-sm font-medium">--</span>
        </div>
        {/* Weekly Fuel Widget */}
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
          <span className="text-xs text-muted-foreground">Fuel/wk</span>
          <span className="text-sm font-medium">--</span>
        </div>
        {/* Neighbourhood Risk Widget */}
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
          <span className="text-xs text-muted-foreground">Risk</span>
          <span className="text-sm font-medium">--</span>
        </div>
        {/* Profile */}
        <button className="rounded-full bg-muted p-1.5 text-xs text-muted-foreground hover:text-foreground">
          2000
        </button>
      </div>
    </header>
  );
}
