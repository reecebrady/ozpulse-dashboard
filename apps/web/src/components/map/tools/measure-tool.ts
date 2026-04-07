/**
 * Measure Tool -- distance measurement on the map.
 *
 * Click to place waypoints, shows running distance.
 * Double-click to finish measurement.
 * Displays distance labels along each segment.
 */

import type maplibregl from "maplibre-gl";
import type { LayerManagerImpl } from "../layer-manager";

const GROUP_ID = "measure-tool";
const LINE_SOURCE = "measure-tool-line";
const POINTS_SOURCE = "measure-tool-points";
const LABELS_SOURCE = "measure-tool-labels";

export interface MeasureResult {
  points: [number, number][];
  segments: { from: [number, number]; to: [number, number]; distanceKm: number }[];
  totalKm: number;
}

export class MeasureTool {
  private map: maplibregl.Map;
  private layerManager: LayerManagerImpl;
  private active = false;
  private points: [number, number][] = [];

  private handleClick: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private handleDblClick: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private handleMouseMove: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private onComplete?: (result: MeasureResult) => void;

  constructor(
    map: maplibregl.Map,
    layerManager: LayerManagerImpl,
    onComplete?: (result: MeasureResult) => void
  ) {
    this.map = map;
    this.layerManager = layerManager;
    this.onComplete = onComplete;
  }

  enable(): void {
    this.disable();
    this.clear();
    this.active = true;
    this.points = [];

    this.map.getCanvas().style.cursor = "crosshair";
    this.map.doubleClickZoom.disable();

    this._registerLayers();

    this.handleClick = (e: maplibregl.MapMouseEvent) => {
      this.points.push([e.lngLat.lng, e.lngLat.lat]);
      this._update();
    };

    this.handleDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      this.points.push([e.lngLat.lng, e.lngLat.lat]);
      this._finalize();
    };

    this.handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (this.points.length === 0) return;
      this._update([e.lngLat.lng, e.lngLat.lat]);
    };

    this.map.on("click", this.handleClick);
    this.map.on("dblclick", this.handleDblClick);
    this.map.on("mousemove", this.handleMouseMove);
  }

  disable(): void {
    this._removeListeners();
    this.active = false;
    this.map.getCanvas().style.cursor = "";
    this.map.doubleClickZoom.enable();
  }

  clear(): void {
    this.points = [];
    this.layerManager.removeLayer(GROUP_ID);
    this.layerManager.removeLayer(`${GROUP_ID}-points`);
    this.layerManager.removeLayer(`${GROUP_ID}-labels`);
  }

  getResult(): MeasureResult | null {
    if (this.points.length < 2) return null;
    const segments = [];
    let totalKm = 0;
    for (let i = 1; i < this.points.length; i++) {
      const d = haversineKm(this.points[i - 1], this.points[i]);
      segments.push({
        from: this.points[i - 1],
        to: this.points[i],
        distanceKm: Math.round(d * 100) / 100,
      });
      totalKm += d;
    }
    return {
      points: [...this.points],
      segments,
      totalKm: Math.round(totalKm * 100) / 100,
    };
  }

  isActive(): boolean {
    return this.active;
  }

  destroy(): void {
    this.disable();
    this.clear();
  }

  // --- Internal ---

  private _registerLayers(): void {
    // Line
    this.layerManager.registerLayer(
      GROUP_ID,
      [
        {
          id: LINE_SOURCE,
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      ],
      [
        {
          id: `${GROUP_ID}-line`,
          type: "line",
          source: LINE_SOURCE,
          paint: {
            "line-color": "#f43f5e",
            "line-width": 3,
            "line-dasharray": [3, 2],
            "line-opacity": 0.9,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        },
      ]
    );

    // Points
    this.layerManager.registerLayer(
      `${GROUP_ID}-points`,
      [
        {
          id: POINTS_SOURCE,
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      ],
      [
        {
          id: `${GROUP_ID}-point-circles`,
          type: "circle",
          source: POINTS_SOURCE,
          paint: {
            "circle-radius": 5,
            "circle-color": "#f43f5e",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        },
      ]
    );

    // Labels (midpoint of each segment)
    this.layerManager.registerLayer(
      `${GROUP_ID}-labels`,
      [
        {
          id: LABELS_SOURCE,
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      ],
      [
        {
          id: `${GROUP_ID}-label-text`,
          type: "symbol",
          source: LABELS_SOURCE,
          layout: {
            "text-field": ["get", "label"],
            "text-size": 12,
            "text-offset": [0, -1],
            "text-anchor": "bottom",
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#fecdd3",
            "text-halo-color": "rgba(15, 23, 42, 0.85)",
            "text-halo-width": 1.5,
          },
        },
      ]
    );
  }

  private _update(previewPoint?: [number, number]): void {
    const coords = [...this.points];
    if (previewPoint) coords.push(previewPoint);

    // Update line
    if (coords.length >= 2) {
      this.layerManager.updateSource(LINE_SOURCE, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
            properties: {},
          },
        ],
      });
    }

    // Update points
    this.layerManager.updateSource(POINTS_SOURCE, {
      type: "FeatureCollection",
      features: this.points.map((coord, i) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: coord },
        properties: { index: i },
      })),
    });

    // Update segment labels
    this._updateLabels(coords);
  }

  private _updateLabels(coords: [number, number][]): void {
    const features: GeoJSON.Feature[] = [];
    let cumulative = 0;

    for (let i = 1; i < coords.length; i++) {
      const d = haversineKm(coords[i - 1], coords[i]);
      cumulative += d;

      const midLng = (coords[i - 1][0] + coords[i][0]) / 2;
      const midLat = (coords[i - 1][1] + coords[i][1]) / 2;

      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [midLng, midLat] },
        properties: {
          label: formatDistance(d),
          cumulative: formatDistance(cumulative),
        },
      });
    }

    // Total distance label at the last point
    if (coords.length >= 2) {
      const last = coords[coords.length - 1];
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: last },
        properties: {
          label: `Total: ${formatDistance(cumulative)}`,
        },
      });
    }

    this.layerManager.updateSource(LABELS_SOURCE, {
      type: "FeatureCollection",
      features,
    });
  }

  private _finalize(): void {
    this._removeListeners();
    this.active = false;
    this.map.getCanvas().style.cursor = "";
    this.map.doubleClickZoom.enable();

    this._update();

    const result = this.getResult();
    if (result) {
      this.onComplete?.(result);
    }
  }

  private _removeListeners(): void {
    if (this.handleClick) {
      this.map.off("click", this.handleClick);
      this.handleClick = null;
    }
    if (this.handleDblClick) {
      this.map.off("dblclick", this.handleDblClick);
      this.handleDblClick = null;
    }
    if (this.handleMouseMove) {
      this.map.off("mousemove", this.handleMouseMove);
      this.handleMouseMove = null;
    }
  }
}

// --- Utilities ---

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km < 100) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}
