"use client";

import type { LayerId, LayerConfig } from "@ozpulse/shared";

const LAYERS: LayerConfig[] = [
  { id: "power-energy", name: "Power & Energy", description: "Generator sites, grid output, fuel prices", icon: "Zap", color: "#eab308", enabled: false },
  { id: "real-estate", name: "Real Estate", description: "Property prices, mortgage impact", icon: "Home", color: "#3b82f6", enabled: false },
  { id: "crime-safety", name: "Crime & Safety", description: "Offence heatmaps, school safety", icon: "Shield", color: "#ef4444", enabled: false },
  { id: "immigration-demographics", name: "Immigration", description: "Migration stats, diaspora maps", icon: "Users", color: "#8b5cf6", enabled: false },
  { id: "infrastructure-industry", name: "Infrastructure", description: "Project pipeline, jobs", icon: "Building2", color: "#f97316", enabled: false },
  { id: "minerals-mining", name: "Mining & Resources", description: "Mine sites, commodity prices", icon: "Mountain", color: "#a3a3a3", enabled: false },
  { id: "leisure-lifestyle", name: "Leisure", description: "Parks, events, weekend planner", icon: "TreePine", color: "#22c55e", enabled: false },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activeLayers: Set<LayerId>;
  onToggleLayer: (id: LayerId) => void;
}

export function Sidebar({ open, onToggle, activeLayers, onToggleLayer }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${
        open ? "w-64" : "w-12"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-b border-border text-muted-foreground hover:text-foreground"
      >
        {open ? "\u2190" : "\u2192"}
      </button>
      {open && (
        <div className="flex-1 overflow-y-auto p-3">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Layers
          </h2>
          <div className="space-y-1">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onToggleLayer(layer.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeLayers.has(layer.id)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <div>
                  <div className="font-medium">{layer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {layer.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
