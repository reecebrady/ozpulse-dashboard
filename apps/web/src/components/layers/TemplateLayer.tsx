"use client";

/**
 * TEMPLATE LAYER COMPONENT
 * Copy this file to create a new map layer.
 * Each layer is lazy-loaded and registers itself with the LayerManager.
 *
 * Steps:
 * 1. Copy this file and rename to YourLayer.tsx
 * 2. Update the layerConfig
 * 3. Add your data fetching via TanStack Query
 * 4. Add your map overlays (GeoJSON, markers, heatmaps) via the map ref
 * 5. Register in the layer registry (src/lib/layers.ts)
 */

import { useEffect } from "react";

interface TemplateLayerProps {
  map: maplibregl.Map | null;
  visible: boolean;
}

export default function TemplateLayer({ map, visible }: TemplateLayerProps) {
  useEffect(() => {
    if (!map) return;

    // Add your map sources and layers here when component mounts
    // Example:
    // map.addSource('my-source', { type: 'geojson', data: geojsonData });
    // map.addLayer({ id: 'my-layer', type: 'circle', source: 'my-source', ... });

    return () => {
      // Cleanup: remove sources and layers
      // if (map.getLayer('my-layer')) map.removeLayer('my-layer');
      // if (map.getSource('my-source')) map.removeSource('my-source');
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    // Toggle visibility when the layer toggle changes
    // map.setLayoutProperty('my-layer', 'visibility', visible ? 'visible' : 'none');
  }, [map, visible]);

  // Return null — layers render on the map, not in React DOM
  // Or return a detail panel component if needed
  return null;
}
