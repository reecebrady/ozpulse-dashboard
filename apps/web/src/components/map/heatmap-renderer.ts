/**
 * Heatmap Renderer -- reusable heatmap layer generator for point data.
 *
 * Usage: layers call `createHeatmapConfig()` to get source + layer definitions,
 * then register them with the LayerManager.
 *
 * Supports:
 * - Configurable color ramps (red-yellow-green, blue-red, custom)
 * - Intensity scaling based on zoom level
 * - Weight property for variable-density heatmaps
 *
 * Used by: energy consumption, property prices, crime rates, demographic density
 */

import type { LayerSourceDef, LayerStyleDef } from "./layer-manager";

// --- Color Ramp Presets ---

export type ColorRampPreset =
  | "red-yellow-green"
  | "blue-red"
  | "blue-purple"
  | "green-yellow-red"
  | "cool-warm"
  | "mono-red"
  | "mono-blue";

type HeatmapColorStop = [number, string];

const COLOR_RAMPS: Record<ColorRampPreset, HeatmapColorStop[]> = {
  "red-yellow-green": [
    [0, "rgba(0,128,0,0)"],
    [0.2, "rgba(34,197,94,0.6)"],
    [0.4, "rgba(250,204,21,0.7)"],
    [0.6, "rgba(249,115,22,0.8)"],
    [0.8, "rgba(239,68,68,0.9)"],
    [1, "rgba(185,28,28,1)"],
  ],
  "blue-red": [
    [0, "rgba(59,130,246,0)"],
    [0.2, "rgba(59,130,246,0.5)"],
    [0.4, "rgba(168,85,247,0.6)"],
    [0.6, "rgba(249,115,22,0.7)"],
    [0.8, "rgba(239,68,68,0.85)"],
    [1, "rgba(185,28,28,1)"],
  ],
  "blue-purple": [
    [0, "rgba(59,130,246,0)"],
    [0.25, "rgba(99,102,241,0.5)"],
    [0.5, "rgba(139,92,246,0.65)"],
    [0.75, "rgba(168,85,247,0.8)"],
    [1, "rgba(126,34,206,1)"],
  ],
  "green-yellow-red": [
    [0, "rgba(16,185,129,0)"],
    [0.25, "rgba(16,185,129,0.5)"],
    [0.5, "rgba(234,179,8,0.65)"],
    [0.75, "rgba(249,115,22,0.8)"],
    [1, "rgba(239,68,68,1)"],
  ],
  "cool-warm": [
    [0, "rgba(6,182,212,0)"],
    [0.25, "rgba(6,182,212,0.5)"],
    [0.5, "rgba(148,163,184,0.6)"],
    [0.75, "rgba(244,63,94,0.8)"],
    [1, "rgba(190,18,60,1)"],
  ],
  "mono-red": [
    [0, "rgba(239,68,68,0)"],
    [0.3, "rgba(239,68,68,0.3)"],
    [0.6, "rgba(220,38,38,0.6)"],
    [0.8, "rgba(185,28,28,0.8)"],
    [1, "rgba(127,29,29,1)"],
  ],
  "mono-blue": [
    [0, "rgba(59,130,246,0)"],
    [0.3, "rgba(59,130,246,0.3)"],
    [0.6, "rgba(37,99,235,0.6)"],
    [0.8, "rgba(29,78,216,0.8)"],
    [1, "rgba(30,58,138,1)"],
  ],
};

// --- Configuration ---

export interface HeatmapConfig {
  /** Unique ID prefix for source and layer IDs */
  id: string;
  /** GeoJSON FeatureCollection of points */
  data: GeoJSON.FeatureCollection;
  /** Color ramp preset name or custom stops */
  colorRamp?: ColorRampPreset | HeatmapColorStop[];
  /** Property name to use as weight (e.g., "price", "count") */
  weightProperty?: string;
  /** Maximum weight value for normalization (auto-detected if omitted) */
  maxWeight?: number;
  /** Heatmap radius in pixels at base zoom */
  radius?: number;
  /** Intensity at the base zoom level (default 1) */
  intensity?: number;
  /** Opacity of the heatmap layer (0-1) */
  opacity?: number;
  /** Minimum zoom level to show heatmap (below this, nothing renders) */
  minzoom?: number;
  /** Zoom level at which heatmap transitions to circles (default 14) */
  transitionZoom?: number;
  /** Whether to also render a circle layer at high zoom (default true) */
  showCirclesAtHighZoom?: boolean;
  /** Circle radius at high zoom (default 6) */
  circleRadius?: number;
  /** Circle color at high zoom */
  circleColor?: string;
}

export interface HeatmapResult {
  sources: LayerSourceDef[];
  layers: LayerStyleDef[];
}

// --- Main API ---

/**
 * Create source + layer definitions for a heatmap.
 * Pass the result to `layerManager.registerLayer(groupId, result.sources, result.layers)`.
 */
export function createHeatmapConfig(config: HeatmapConfig): HeatmapResult {
  const {
    id,
    data,
    colorRamp = "blue-red",
    weightProperty,
    maxWeight,
    radius = 25,
    intensity = 1,
    opacity = 0.8,
    minzoom = 2,
    transitionZoom = 14,
    showCirclesAtHighZoom = true,
    circleRadius = 6,
    circleColor = "#3b82f6",
  } = config;

  const sourceId = `${id}-heatmap-source`;
  const heatmapLayerId = `${id}-heatmap-layer`;
  const circleLayerId = `${id}-circle-layer`;

  // Build color expression
  const colorStops = Array.isArray(colorRamp)
    ? colorRamp
    : COLOR_RAMPS[colorRamp] ?? COLOR_RAMPS["blue-red"];

  const heatmapColorExpr: unknown[] = ["interpolate", ["linear"], ["heatmap-density"]];
  for (const [stop, color] of colorStops) {
    heatmapColorExpr.push(stop, color);
  }

  // Build weight expression
  let weightExpr: unknown = 1;
  if (weightProperty) {
    if (maxWeight) {
      // Normalize to 0-1 range
      weightExpr = ["/", ["get", weightProperty], maxWeight];
    } else {
      weightExpr = ["get", weightProperty];
    }
  }

  // Source definition
  const sources: LayerSourceDef[] = [
    {
      id: sourceId,
      type: "geojson",
      data,
    },
  ];

  // Heatmap layer -- visible from minzoom to transitionZoom
  const layers: LayerStyleDef[] = [
    {
      id: heatmapLayerId,
      type: "heatmap",
      source: sourceId,
      minzoom,
      maxzoom: transitionZoom + 1,
      paint: {
        // Weight
        "heatmap-weight": weightExpr,
        // Intensity increases with zoom
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          minzoom,
          intensity * 0.3,
          transitionZoom,
          intensity * 3,
        ],
        // Radius increases with zoom
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          minzoom,
          radius * 0.5,
          Math.floor((minzoom + transitionZoom) / 2),
          radius,
          transitionZoom,
          radius * 2,
        ],
        "heatmap-color": heatmapColorExpr,
        // Fade out as we approach transition zoom
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          minzoom,
          opacity,
          transitionZoom - 1,
          opacity,
          transitionZoom,
          0,
        ],
      },
    },
  ];

  // Optional circle layer for high zoom
  if (showCirclesAtHighZoom) {
    layers.push({
      id: circleLayerId,
      type: "circle",
      source: sourceId,
      minzoom: transitionZoom - 1,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          transitionZoom - 1,
          0,
          transitionZoom,
          circleRadius,
          18,
          circleRadius * 2,
        ],
        "circle-color": circleColor,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          transitionZoom - 1,
          0,
          transitionZoom,
          0.85,
        ],
      },
    });
  }

  return { sources, layers };
}

/**
 * Convenience: compute max weight from a feature collection property.
 */
export function computeMaxWeight(
  data: GeoJSON.FeatureCollection,
  property: string
): number {
  let max = 0;
  for (const feature of data.features) {
    const val = feature.properties?.[property];
    if (typeof val === "number" && val > max) max = val;
  }
  return max || 1;
}

/**
 * Build a GeoJSON FeatureCollection from an array of point objects.
 * Each item must have lat, lng, and any properties to include.
 */
export function pointsToGeoJSON<
  T extends { lat: number; lng: number; [key: string]: unknown }
>(points: T[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((pt) => {
      const { lat, lng, ...props } = pt;
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        properties: props as GeoJSON.GeoJsonProperties,
      };
    }),
  };
}
