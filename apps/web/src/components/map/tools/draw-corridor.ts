/**
 * Draw Corridor Tool -- draw a commute corridor on the map.
 *
 * Two modes:
 * 1. Point-to-point: click to add waypoints, double-click to finish
 * 2. Freehand: click-drag to draw, release to finish
 *
 * Used by the crime "where you should be" tool to define a corridor,
 * then query crime data along that path.
 */

import type maplibregl from "maplibre-gl";
import type { LayerManagerImpl } from "../layer-manager";
import { createCirclePolygon } from "../polygon-overlay";

export type DrawMode = "point-to-point" | "freehand";

export interface CorridorResult {
  /** The drawn path coordinates [lng, lat][] */
  path: [number, number][];
  /** Buffer distance in km */
  bufferKm: number;
  /** Approximate total distance in km */
  distanceKm: number;
}

const GROUP_ID = "draw-corridor";
const SOURCE_ID = "draw-corridor-source";
const POINTS_SOURCE_ID = "draw-corridor-points";
const BUFFER_SOURCE_ID = "draw-corridor-buffer";

export class DrawCorridorTool {
  private map: maplibregl.Map;
  private layerManager: LayerManagerImpl;
  private mode: DrawMode = "point-to-point";
  private active = false;
  private points: [number, number][] = [];
  private bufferKm: number;
  private onComplete?: (result: CorridorResult) => void;

  // Event handler refs for cleanup
  private handleClick: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private handleDblClick: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private handleMouseMove: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private handleMouseDown: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private handleMouseUp: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private isDrawing = false;

  constructor(
    map: maplibregl.Map,
    layerManager: LayerManagerImpl,
    options?: {
      bufferKm?: number;
      onComplete?: (result: CorridorResult) => void;
    }
  ) {
    this.map = map;
    this.layerManager = layerManager;
    this.bufferKm = options?.bufferKm ?? 2;
    this.onComplete = options?.onComplete;
  }

  /**
   * Start drawing. Pass "point-to-point" or "freehand".
   */
  enable(mode: DrawMode = "point-to-point"): void {
    this.disable();
    this.mode = mode;
    this.active = true;
    this.points = [];

    this.map.getCanvas().style.cursor = "crosshair";

    // Register empty layers
    this._registerLayers();

    if (mode === "point-to-point") {
      this._enablePointToPoint();
    } else {
      this._enableFreehand();
    }
  }

  /**
   * Disable the tool and clean up event listeners.
   */
  disable(): void {
    this._removeListeners();
    this.active = false;
    this.isDrawing = false;
    this.map.getCanvas().style.cursor = "";

    // Re-enable double-click zoom if it was disabled
    if (this.map.doubleClickZoom) {
      this.map.doubleClickZoom.enable();
    }
  }

  /**
   * Clear the drawn corridor from the map.
   */
  clear(): void {
    this.points = [];
    this.layerManager.removeLayer(GROUP_ID);
    this.layerManager.removeLayer(`${GROUP_ID}-points`);
    this.layerManager.removeLayer(`${GROUP_ID}-buffer`);
  }

  /**
   * Get the current drawn corridor.
   */
  getResult(): CorridorResult | null {
    if (this.points.length < 2) return null;
    return {
      path: [...this.points],
      bufferKm: this.bufferKm,
      distanceKm: this._computeDistance(),
    };
  }

  setBufferKm(km: number): void {
    this.bufferKm = km;
    if (this.points.length >= 2) {
      this._updateBuffer();
    }
  }

  isActive(): boolean {
    return this.active;
  }

  destroy(): void {
    this.disable();
    this.clear();
  }

  // --- Point-to-point mode ---

  private _enablePointToPoint(): void {
    // Disable double-click zoom while drawing
    this.map.doubleClickZoom.disable();

    this.handleClick = (e: maplibregl.MapMouseEvent) => {
      this.points.push([e.lngLat.lng, e.lngLat.lat]);
      this._updateLine();
      this._updatePointMarkers();
    };

    this.handleDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      // Add the final point
      this.points.push([e.lngLat.lng, e.lngLat.lat]);
      this._finalize();
    };

    this.handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (this.points.length === 0) return;
      // Show a preview line from last point to cursor
      this._updateLine([e.lngLat.lng, e.lngLat.lat]);
    };

    this.map.on("click", this.handleClick);
    this.map.on("dblclick", this.handleDblClick);
    this.map.on("mousemove", this.handleMouseMove);
  }

  // --- Freehand mode ---

  private _enableFreehand(): void {
    this.handleMouseDown = (e: maplibregl.MapMouseEvent) => {
      this.isDrawing = true;
      this.points = [[e.lngLat.lng, e.lngLat.lat]];
      this.map.dragPan.disable();
      this._updateLine();
    };

    this.handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!this.isDrawing) return;
      // Throttle: only add point if distance from last is significant
      const last = this.points[this.points.length - 1];
      const dx = e.lngLat.lng - last[0];
      const dy = e.lngLat.lat - last[1];
      if (Math.sqrt(dx * dx + dy * dy) > 0.001) {
        this.points.push([e.lngLat.lng, e.lngLat.lat]);
        this._updateLine();
      }
    };

    this.handleMouseUp = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.map.dragPan.enable();
      if (this.points.length >= 2) {
        this._finalize();
      }
    };

    this.map.on("mousedown", this.handleMouseDown);
    this.map.on("mousemove", this.handleMouseMove);
    this.map.on("mouseup", this.handleMouseUp);
  }

  // --- Rendering ---

  private _registerLayers(): void {
    // Main line
    this.layerManager.registerLayer(
      GROUP_ID,
      [
        {
          id: SOURCE_ID,
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      ],
      [
        {
          id: `${GROUP_ID}-line`,
          type: "line",
          source: SOURCE_ID,
          paint: {
            "line-color": "#f59e0b",
            "line-width": 4,
            "line-opacity": 0.85,
          },
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
        },
      ]
    );

    // Point markers
    this.layerManager.registerLayer(
      `${GROUP_ID}-points`,
      [
        {
          id: POINTS_SOURCE_ID,
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      ],
      [
        {
          id: `${GROUP_ID}-point-circles`,
          type: "circle",
          source: POINTS_SOURCE_ID,
          paint: {
            "circle-radius": 5,
            "circle-color": "#f59e0b",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        },
      ]
    );

    // Buffer zone (shown after finalize)
    this.layerManager.registerLayer(
      `${GROUP_ID}-buffer`,
      [
        {
          id: BUFFER_SOURCE_ID,
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      ],
      [
        {
          id: `${GROUP_ID}-buffer-fill`,
          type: "fill",
          source: BUFFER_SOURCE_ID,
          paint: {
            "fill-color": "#f59e0b",
            "fill-opacity": 0.08,
          },
        },
        {
          id: `${GROUP_ID}-buffer-outline`,
          type: "line",
          source: BUFFER_SOURCE_ID,
          paint: {
            "line-color": "#f59e0b",
            "line-width": 1.5,
            "line-dasharray": [4, 3],
            "line-opacity": 0.4,
          },
        },
      ]
    );
  }

  private _updateLine(previewPoint?: [number, number]): void {
    const coords = [...this.points];
    if (previewPoint) coords.push(previewPoint);

    if (coords.length < 2) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        },
      ],
    };

    this.layerManager.updateSource(SOURCE_ID, geojson);
  }

  private _updatePointMarkers(): void {
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: this.points.map((coord, i) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: coord },
        properties: { index: i },
      })),
    };

    this.layerManager.updateSource(POINTS_SOURCE_ID, geojson);
  }

  private _updateBuffer(): void {
    if (this.points.length < 2) return;

    // Create buffer circles along the path and merge them
    // Simple approach: create circles at each point and every N intermediate points
    const bufferFeatures: GeoJSON.Feature[] = [];
    const step = Math.max(1, Math.floor(this.points.length / 30)); // Limit feature count

    for (let i = 0; i < this.points.length; i += step) {
      bufferFeatures.push(createCirclePolygon(this.points[i], this.bufferKm, 32));
    }
    // Always include last point
    if (this.points.length > 1) {
      bufferFeatures.push(
        createCirclePolygon(this.points[this.points.length - 1], this.bufferKm, 32)
      );
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: bufferFeatures,
    };

    this.layerManager.updateSource(BUFFER_SOURCE_ID, geojson);
  }

  private _finalize(): void {
    this._removeListeners();
    this.active = false;
    this.map.getCanvas().style.cursor = "";

    // Re-enable map interactions
    if (this.map.doubleClickZoom) {
      this.map.doubleClickZoom.enable();
    }
    if (!this.map.dragPan.isEnabled()) {
      this.map.dragPan.enable();
    }

    // Update visual with final line and buffer
    this._updateLine();
    this._updatePointMarkers();
    this._updateBuffer();

    // Notify callback
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
    if (this.handleMouseDown) {
      this.map.off("mousedown", this.handleMouseDown);
      this.handleMouseDown = null;
    }
    if (this.handleMouseUp) {
      this.map.off("mouseup", this.handleMouseUp);
      this.handleMouseUp = null;
    }
  }

  private _computeDistance(): number {
    let total = 0;
    for (let i = 1; i < this.points.length; i++) {
      total += haversineKm(this.points[i - 1], this.points[i]);
    }
    return Math.round(total * 10) / 10;
  }
}

/**
 * Haversine distance between two [lng, lat] points in km.
 */
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
