import type { LayerConfig } from "@ozpulse/shared";

export const immigrationLayerConfig: LayerConfig = {
  id: "immigration-demographics",
  name: "Immigration & Demographics",
  description:
    "ABS migration statistics, diaspora concentration maps, workforce composition shifts, settlement patterns with housing pressure overlays",
  icon: "globe",
  color: "#3b82f6",
  enabled: false,
  sublayers: [
    { id: "migration-heatmap", name: "Net Migration Heatmap", enabled: true },
    { id: "diaspora-concentration", name: "Diaspora Concentration", enabled: false },
    { id: "migration-flows", name: "Global Flow Arrows", enabled: false },
    { id: "workforce-shifts", name: "Workforce Composition", enabled: false },
    { id: "settlement-patterns", name: "Settlement Patterns", enabled: false },
  ],
};

// MapLibre source and layer IDs used by this module
export const IMMIGRATION_MAP_IDS = {
  sources: {
    heatmap: "migration-heatmap-source",
    flows: "migration-flow-source",
    origins: "migration-origin-source",
    diaspora: "diaspora-concentration-source",
    settlement: "settlement-pattern-source",
  },
  layers: {
    heatmap: "migration-heatmap-layer",
    circles: "migration-circles-layer",
    flows: "migration-flow-layer",
    origins: "migration-origin-layer",
    diaspora: "diaspora-concentration-layer",
    settlement: "settlement-pattern-layer",
  },
} as const;

// Layer registration function for Agent 3's LayerManager
export function registerImmigrationLayer(
  layerManager: {
    register: (config: LayerConfig & { sourceIds: string[]; layerIds: string[] }) => void;
  }
) {
  layerManager.register({
    ...immigrationLayerConfig,
    sourceIds: Object.values(IMMIGRATION_MAP_IDS.sources),
    layerIds: Object.values(IMMIGRATION_MAP_IDS.layers),
  });
}
