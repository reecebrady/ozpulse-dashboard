"use client";

/**
 * TEMPLATE: Copy this file to create a new layer component.
 *
 * Each layer module must:
 * 1. Export a React component that renders layer-specific UI (charts, info panels)
 * 2. Export a `getMapSources()` function returning GeoJSON/tile sources for the map
 * 3. Export a `getMapLayers()` function returning MapLibre layer definitions
 * 4. Use TanStack Query for all data fetching with appropriate refresh intervals
 * 5. Register alerts via the shared alert system
 *
 * File naming convention: apps/web/src/components/layers/{layer-name}/index.tsx
 */

import type { LayerId } from "@ozpulse/shared";

export const LAYER_ID: LayerId = "power-energy"; // Change this

export interface LayerPanelProps {
  postcode: string;
  visible: boolean;
}

export function LayerPanel({ postcode, visible }: LayerPanelProps) {
  if (!visible) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Layer Name</h3>
      <p className="text-xs text-muted-foreground">
        Data for postcode {postcode}
      </p>
      {/* Layer-specific charts and data here */}
    </div>
  );
}

/**
 * Return map source definitions for this layer.
 * Called by the LayerManager when this layer is toggled on.
 */
export function getMapSources() {
  return {
    // "source-id": { type: "geojson", data: { ... } }
  };
}

/**
 * Return MapLibre layer style definitions.
 * Called by the LayerManager when this layer is toggled on.
 */
export function getMapLayers() {
  return [
    // { id: "layer-id", type: "circle", source: "source-id", paint: { ... } }
  ];
}
