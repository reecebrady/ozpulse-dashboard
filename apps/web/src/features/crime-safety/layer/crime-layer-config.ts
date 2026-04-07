import type { LayerConfig } from "@ozpulse/shared";

export const crimeLayerConfig: LayerConfig = {
  id: "crime-safety",
  name: "Crime & Safety",
  description:
    "Postcode and SA3-level heatmaps from ABS Recorded Crime and state police open data, school safety scores, corridor analysis",
  icon: "shield-alert",
  color: "#ef4444",
  enabled: false,
  sublayers: [
    { id: "crime-heatmap", name: "Crime Heatmap", enabled: true },
    { id: "crime-schools", name: "School Safety", enabled: false },
    { id: "crime-corridor", name: "Safe Corridor Tool", enabled: false },
  ],
};

// MapLibre source and layer IDs used by this module
export const CRIME_MAP_IDS = {
  sources: {
    heatmap: "crime-heatmap-source",
    schools: "crime-schools-source",
    corridor: "safe-corridor-source",
    corridorHotspots: "corridor-hotspot-source",
  },
  layers: {
    heatmap: "crime-heatmap-layer",
    circles: "crime-circles-layer",
    schools: "crime-schools-layer",
    corridor: "safe-corridor-layer",
    corridorLine: "safe-corridor-line-layer",
    corridorHotspots: "corridor-hotspot-layer",
  },
} as const;

// Layer registration function for Agent 3's LayerManager
export function registerCrimeLayer(
  layerManager: {
    register: (config: LayerConfig & { sourceIds: string[]; layerIds: string[] }) => void;
  }
) {
  layerManager.register({
    ...crimeLayerConfig,
    sourceIds: Object.values(CRIME_MAP_IDS.sources),
    layerIds: Object.values(CRIME_MAP_IDS.layers),
  });
}
