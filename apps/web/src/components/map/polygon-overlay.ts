/**
 * Polygon Overlay -- renders polygon/multi-polygon features on the map.
 *
 * Used for: postcode boundaries, SA3/SA4 regions, school catchments,
 * electorate boundaries, council areas.
 *
 * Supports choropleth coloring (data-driven fill based on a property value).
 */

import type { LayerSourceDef, LayerStyleDef } from "./layer-manager";

// --- Types ---

export interface PolygonFeature {
  id: string;
  coordinates: [number, number][][] | [number, number][][][]; // Polygon or MultiPolygon rings
  isMultiPolygon?: boolean;
  properties?: Record<string, unknown>;
}

export interface PolygonOverlayConfig {
  /** Unique ID for this polygon group */
  id: string;
  /** Polygon features, or a pre-built GeoJSON FeatureCollection */
  polygons?: PolygonFeature[];
  geojson?: GeoJSON.FeatureCollection;
  /** Fill color (CSS color string). Ignored if choropleth is configured. */
  fillColor?: string;
  /** Fill opacity (0-1) */
  fillOpacity?: number;
  /** Outline color */
  outlineColor?: string;
  /** Outline width */
  outlineWidth?: number;
  /** Outline opacity (0-1) */
  outlineOpacity?: number;
  /** Min zoom to show */
  minzoom?: number;
  /** Max zoom to show */
  maxzoom?: number;
  /** Choropleth configuration -- color polygons based on a numeric property */
  choropleth?: ChoroplethConfig;
  /** Whether to show labels on polygons */
  showLabels?: boolean;
  /** Property name to use for labels */
  labelProperty?: string;
}

export interface ChoroplethConfig {
  /** Property name containing the numeric value */
  property: string;
  /** Minimum value (maps to first color) */
  min: number;
  /** Maximum value (maps to last color) */
  max: number;
  /** Array of colors from low to high */
  colors: string[];
  /** Whether to use linear or step interpolation (default "linear") */
  interpolation?: "linear" | "step";
}

export interface PolygonOverlayResult {
  sources: LayerSourceDef[];
  layers: LayerStyleDef[];
}

// --- Choropleth Presets ---

export const CHOROPLETH_SCALES = {
  /** Green (low) to Red (high) -- e.g., crime rates */
  "green-red": ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"],
  /** Blue (low) to Red (high) -- e.g., property prices */
  "blue-red": ["#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e", "#dc2626"],
  /** Light to dark blue -- e.g., population density */
  "blue-sequential": ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"],
  /** Light to dark green -- e.g., income levels */
  "green-sequential": ["#dcfce7", "#86efac", "#22c55e", "#15803d", "#14532d"],
  /** Light to dark purple -- e.g., demographic concentration */
  "purple-sequential": ["#f3e8ff", "#c084fc", "#a855f7", "#7c3aed", "#581c87"],
  /** Diverging: blue (negative) -> white -> red (positive) */
  "diverging-blue-red": ["#1d4ed8", "#93c5fd", "#f5f5f5", "#fca5a5", "#dc2626"],
} as const;

// --- Main API ---

/**
 * Create source + layer definitions for a polygon overlay.
 */
export function createPolygonOverlay(config: PolygonOverlayConfig): PolygonOverlayResult {
  const {
    id,
    polygons,
    geojson: providedGeoJSON,
    fillColor = "rgba(59, 130, 246, 0.2)",
    fillOpacity = 0.5,
    outlineColor = "#3b82f6",
    outlineWidth = 1.5,
    outlineOpacity = 0.8,
    minzoom,
    maxzoom,
    choropleth,
    showLabels = false,
    labelProperty = "name",
  } = config;

  const sourceId = `${id}-polygon-source`;
  const fillLayerId = `${id}-polygon-fill`;
  const outlineLayerId = `${id}-polygon-outline`;
  const labelLayerId = `${id}-polygon-label`;

  // Build GeoJSON
  const geojson: GeoJSON.FeatureCollection =
    providedGeoJSON ??
    buildPolygonGeoJSON(polygons ?? []);

  const sources: LayerSourceDef[] = [
    {
      id: sourceId,
      type: "geojson",
      data: geojson,
    },
  ];

  // Build fill paint
  const fillPaint: Record<string, unknown> = {
    "fill-opacity": fillOpacity,
  };

  if (choropleth) {
    fillPaint["fill-color"] = buildChoroplethExpression(choropleth);
  } else {
    fillPaint["fill-color"] = fillColor;
  }

  const layers: LayerStyleDef[] = [
    // Fill layer
    {
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: fillPaint,
      ...(minzoom != null && { minzoom }),
      ...(maxzoom != null && { maxzoom }),
    },
    // Outline layer
    {
      id: outlineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": outlineColor,
        "line-width": outlineWidth,
        "line-opacity": outlineOpacity,
      },
      ...(minzoom != null && { minzoom }),
      ...(maxzoom != null && { maxzoom }),
    },
  ];

  // Optional label layer
  if (showLabels) {
    layers.push({
      id: labelLayerId,
      type: "symbol",
      source: sourceId,
      layout: {
        "text-field": ["get", labelProperty],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6,
          10,
          12,
          13,
          16,
          16,
        ],
        "text-anchor": "center",
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#e2e8f0",
        "text-halo-color": "rgba(15, 23, 42, 0.8)",
        "text-halo-width": 1.5,
      },
      ...(minzoom != null && { minzoom }),
      ...(maxzoom != null && { maxzoom }),
    });
  }

  return { sources, layers };
}

// --- Helpers ---

function buildPolygonGeoJSON(polygons: PolygonFeature[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: polygons.map((poly) => ({
      type: "Feature" as const,
      geometry: poly.isMultiPolygon
        ? {
            type: "MultiPolygon" as const,
            coordinates: poly.coordinates as [number, number][][][],
          }
        : {
            type: "Polygon" as const,
            coordinates: poly.coordinates as [number, number][][],
          },
      properties: {
        id: poly.id,
        ...(poly.properties ?? {}),
      },
    })),
  };
}

function buildChoroplethExpression(config: ChoroplethConfig): unknown[] {
  const { property, min, max, colors, interpolation = "linear" } = config;

  if (interpolation === "step") {
    // Step expression: discrete color stops
    const stepSize = (max - min) / colors.length;
    const expr: unknown[] = ["step", ["get", property], colors[0]];
    for (let i = 1; i < colors.length; i++) {
      expr.push(min + stepSize * i, colors[i]);
    }
    return expr;
  }

  // Linear interpolation
  const expr: unknown[] = [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", property], min],
  ];
  for (let i = 0; i < colors.length; i++) {
    const value = min + ((max - min) * i) / (colors.length - 1);
    expr.push(value, colors[i]);
  }
  return expr;
}

/**
 * Create a circle polygon (approximated) for a given center and radius.
 * Useful for rendering radius circles around pinned postcodes.
 */
export function createCirclePolygon(
  center: [number, number], // [lng, lat]
  radiusKm: number,
  segments = 64
): GeoJSON.Feature {
  const [lng, lat] = center;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    // Approximate: 1 degree lat ~= 111km, 1 degree lng ~= 111km * cos(lat)
    const dLat = (radiusKm / 111) * Math.sin(angle);
    const dLng = (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
    coordinates.push([lng + dLng, lat + dLat]);
  }

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
    properties: {
      center_lng: lng,
      center_lat: lat,
      radius_km: radiusKm,
    },
  };
}
