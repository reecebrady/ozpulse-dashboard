/**
 * Line Overlay -- renders line features on the map.
 *
 * Used for: transmission lines, commute routes, migration flow arrows,
 * infrastructure corridors.
 *
 * Provides helper functions to build source + layer definitions
 * that can be registered with the LayerManager.
 */

import type { LayerSourceDef, LayerStyleDef } from "./layer-manager";

// --- Types ---

export interface LineFeature {
  id: string;
  coordinates: [number, number][]; // Array of [lng, lat] pairs
  properties?: Record<string, unknown>;
}

export interface LineOverlayConfig {
  /** Unique ID for this line group */
  id: string;
  /** Line features to render */
  lines: LineFeature[];
  /** Line color (CSS color string) */
  color?: string;
  /** Line width in pixels */
  width?: number;
  /** Line opacity (0-1) */
  opacity?: number;
  /** Dash pattern [dash, gap] in pixels. Omit for solid line. */
  dashArray?: [number, number];
  /** Whether to show directional arrows along the line */
  showArrows?: boolean;
  /** Whether line width should scale with zoom */
  zoomScaling?: boolean;
  /** Min zoom to show the layer */
  minzoom?: number;
  /** Max zoom to show the layer */
  maxzoom?: number;
  /** If true, use data-driven color from feature property "color" */
  dataDrivenColor?: boolean;
  /** If true, use data-driven width from feature property "width" */
  dataDrivenWidth?: boolean;
}

export interface LineOverlayResult {
  sources: LayerSourceDef[];
  layers: LayerStyleDef[];
}

// --- Main API ---

/**
 * Create source + layer definitions for a line overlay.
 */
export function createLineOverlay(config: LineOverlayConfig): LineOverlayResult {
  const {
    id,
    lines,
    color = "#3b82f6",
    width = 3,
    opacity = 0.85,
    dashArray,
    showArrows = false,
    zoomScaling = false,
    minzoom,
    maxzoom,
    dataDrivenColor = false,
    dataDrivenWidth = false,
  } = config;

  const sourceId = `${id}-line-source`;
  const lineLayerId = `${id}-line-layer`;
  const arrowLayerId = `${id}-arrow-layer`;

  // Build GeoJSON from line features
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: lines.map((line) => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: line.coordinates,
      },
      properties: {
        id: line.id,
        ...(line.properties ?? {}),
      },
    })),
  };

  const sources: LayerSourceDef[] = [
    {
      id: sourceId,
      type: "geojson",
      data: geojson,
    },
  ];

  // Build line paint properties
  const linePaint: Record<string, unknown> = {
    "line-color": dataDrivenColor ? ["coalesce", ["get", "color"], color] : color,
    "line-opacity": opacity,
  };

  if (dataDrivenWidth) {
    linePaint["line-width"] = ["coalesce", ["get", "width"], width];
  } else if (zoomScaling) {
    linePaint["line-width"] = [
      "interpolate",
      ["linear"],
      ["zoom"],
      4,
      width * 0.5,
      8,
      width,
      14,
      width * 2,
    ];
  } else {
    linePaint["line-width"] = width;
  }

  const lineLayout: Record<string, unknown> = {
    "line-cap": "round",
    "line-join": "round",
  };

  if (dashArray) {
    linePaint["line-dasharray"] = dashArray;
  }

  const layers: LayerStyleDef[] = [
    {
      id: lineLayerId,
      type: "line",
      source: sourceId,
      paint: linePaint,
      layout: lineLayout,
      ...(minzoom != null && { minzoom }),
      ...(maxzoom != null && { maxzoom }),
    },
  ];

  // Optional directional arrows
  if (showArrows) {
    layers.push({
      id: arrowLayerId,
      type: "symbol",
      source: sourceId,
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 100,
        "text-field": "▶",
        "text-size": 12,
        "text-rotation-alignment": "map",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": dataDrivenColor ? ["coalesce", ["get", "color"], color] : color,
        "text-halo-color": "rgba(0,0,0,0.3)",
        "text-halo-width": 1,
      },
      ...(minzoom != null && { minzoom }),
      ...(maxzoom != null && { maxzoom }),
    });
  }

  return { sources, layers };
}

/**
 * Create a GeoJSON LineString from an array of coordinates.
 * Useful for ad-hoc line creation.
 */
export function coordinatesToLineGeoJSON(
  coordinates: [number, number][],
  properties?: Record<string, unknown>
): GeoJSON.Feature {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: properties ?? {},
  };
}

/**
 * Create a great-circle arc between two points (for global flow lines).
 * Returns an array of intermediate coordinates.
 */
export function greatCircleArc(
  from: [number, number],
  to: [number, number],
  segments = 50
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const lambda1 = toRad(lng1);
  const lambda2 = toRad(lng2);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((phi2 - phi1) / 2), 2) +
          Math.cos(phi1) *
            Math.cos(phi2) *
            Math.pow(Math.sin((lambda2 - lambda1) / 2), 2)
      )
    );

  if (d === 0) return [from, to];

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x =
      A * Math.cos(phi1) * Math.cos(lambda1) +
      B * Math.cos(phi2) * Math.cos(lambda2);
    const y =
      A * Math.cos(phi1) * Math.sin(lambda1) +
      B * Math.cos(phi2) * Math.sin(lambda2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));
    points.push([lng, lat]);
  }

  return points;
}
