"use client";

import { useState } from "react";

/**
 * Main dashboard layout:
 * - Full-screen map (center)
 * - Collapsible left sidebar (layer toggles)
 * - Top bar (profile stats: mortgage, fuel, risk)
 * - Right panel (detail charts on click)
 * - Bottom alert feed
 */
export function DashboardShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailPanel, setDetailPanel] = useState<React.ReactNode | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Profile Bar */}
      <header className="h-12 border-b border-[var(--border)] bg-[var(--panel-bg)] flex items-center px-4 shrink-0 z-20">
        <span className="font-semibold text-sm">OzPulse</span>
        <div className="ml-auto flex gap-4 text-xs text-gray-500">
          <span>Mortgage: --</span>
          <span>Fuel: --/wk</span>
          <span>Risk: --</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Layer Toggles */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-[var(--border)] bg-[var(--sidebar-bg)] overflow-y-auto shrink-0 z-10">
            <div className="p-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Layers</h2>
              <div className="space-y-1 text-sm">
                {[
                  "Power & Energy",
                  "Real Estate",
                  "Crime & Safety",
                  "Immigration & Demographics",
                  "Infrastructure",
                  "Mining & Resources",
                  "Leisure & Lifestyle",
                  "Education",
                  "Government",
                  "Traffic & Commute",
                  "Health",
                ].map((layer) => (
                  <label key={layer} className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>{layer}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Map Area */}
        <main className="flex-1 relative">
          <div id="map-container" className="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400">
            Map loads here (MapLibre GL JS)
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-800 border border-[var(--border)] rounded px-2 py-1 text-xs"
          >
            {sidebarOpen ? "Hide" : "Layers"}
          </button>
        </main>

        {/* Right Detail Panel */}
        {detailPanel && (
          <aside className="w-96 border-l border-[var(--border)] bg-[var(--panel-bg)] overflow-y-auto shrink-0">
            <div className="p-4">
              <button onClick={() => setDetailPanel(null)} className="text-xs text-gray-500 mb-2">Close</button>
              {detailPanel}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Alert Feed */}
      <footer className="h-10 border-t border-[var(--border)] bg-[var(--panel-bg)] flex items-center px-4 text-xs text-gray-500 shrink-0 z-20">
        Alerts will appear here
      </footer>
    </div>
  );
}
