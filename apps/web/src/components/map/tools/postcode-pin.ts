/**
 * Postcode Pin Tool -- click to pin home/work/school postcodes on the map.
 * Shows a radius circle around the pinned location.
 *
 * Usage:
 *   const tool = new PostcodePinTool(map, layerManager);
 *   tool.enable("home");
 *   // User clicks the map -> pin placed + radius circle drawn
 *   tool.disable();
 */

import type maplibregl from "maplibre-gl";
import type { LayerManagerImpl } from "../layer-manager";
import { createCirclePolygon } from "../polygon-overlay";

export type PinRole = "home" | "work" | "school";

export interface PostcodePin {
  role: PinRole;
  lngLat: [number, number];
  postcode?: string;
  radiusKm: number;
}

const PIN_ROLE_COLORS: Record<PinRole, string> = {
  home: "#06b6d4",
  work: "#8b5cf6",
  school: "#3b82f6",
};

export class PostcodePinTool {
  private map: maplibregl.Map;
  private layerManager: LayerManagerImpl;
  private activeRole: PinRole | null = null;
  private pins = new Map<PinRole, PostcodePin>();
  private clickHandler: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  private onPinPlaced?: (pin: PostcodePin) => void;

  constructor(
    map: maplibregl.Map,
    layerManager: LayerManagerImpl,
    onPinPlaced?: (pin: PostcodePin) => void
  ) {
    this.map = map;
    this.layerManager = layerManager;
    this.onPinPlaced = onPinPlaced;
  }

  /**
   * Enable the tool for a given role. Next map click places the pin.
   */
  enable(role: PinRole, radiusKm = 5): void {
    this.disable();
    this.activeRole = role;

    this.map.getCanvas().style.cursor = "crosshair";

    this.clickHandler = (e: maplibregl.MapMouseEvent) => {
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      this.placePin(role, lngLat, radiusKm);
      this.disable();
    };

    this.map.once("click", this.clickHandler);
  }

  /**
   * Disable the tool (remove click listener, restore cursor).
   */
  disable(): void {
    if (this.clickHandler) {
      this.map.off("click", this.clickHandler);
      this.clickHandler = null;
    }
    this.activeRole = null;
    this.map.getCanvas().style.cursor = "";
  }

  /**
   * Programmatically place a pin at a given location.
   */
  placePin(role: PinRole, lngLat: [number, number], radiusKm = 5, postcode?: string): void {
    // Remove existing pin for this role
    this.removePin(role);

    const pin: PostcodePin = { role, lngLat, postcode, radiusKm };
    this.pins.set(role, pin);

    const color = PIN_ROLE_COLORS[role];
    const groupId = `postcode-pin-${role}`;
    const sourceId = `${groupId}-source`;

    // Create the radius circle
    const circleFeature = createCirclePolygon(lngLat, radiusKm);

    // Create the center point
    const centerFeature: GeoJSON.Feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: lngLat },
      properties: { role, postcode: postcode ?? "" },
    };

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [circleFeature, centerFeature],
    };

    this.layerManager.registerLayer(
      groupId,
      [{ id: sourceId, type: "geojson", data: geojson }],
      [
        {
          id: `${groupId}-fill`,
          type: "fill",
          source: sourceId,
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: {
            "fill-color": color,
            "fill-opacity": 0.1,
          },
        },
        {
          id: `${groupId}-outline`,
          type: "line",
          source: sourceId,
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: {
            "line-color": color,
            "line-width": 2,
            "line-dasharray": [4, 3],
            "line-opacity": 0.6,
          },
        },
        {
          id: `${groupId}-center`,
          type: "circle",
          source: sourceId,
          filter: ["==", ["geometry-type"], "Point"],
          paint: {
            "circle-radius": 8,
            "circle-color": color,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-opacity": 0.9,
          },
        },
        {
          id: `${groupId}-label`,
          type: "symbol",
          source: sourceId,
          filter: ["==", ["geometry-type"], "Point"],
          layout: {
            "text-field": role.charAt(0).toUpperCase() + role.slice(1),
            "text-size": 11,
            "text-offset": [0, -1.8],
            "text-anchor": "bottom",
          },
          paint: {
            "text-color": "#e2e8f0",
            "text-halo-color": "rgba(15, 23, 42, 0.8)",
            "text-halo-width": 1.5,
          },
        },
      ]
    );

    this.onPinPlaced?.(pin);
  }

  /**
   * Remove a pin for a given role.
   */
  removePin(role: PinRole): void {
    this.pins.delete(role);
    this.layerManager.removeLayer(`postcode-pin-${role}`);
  }

  /**
   * Remove all pins.
   */
  removeAll(): void {
    for (const role of this.pins.keys()) {
      this.layerManager.removeLayer(`postcode-pin-${role}`);
    }
    this.pins.clear();
  }

  /**
   * Update the radius of an existing pin.
   */
  updateRadius(role: PinRole, radiusKm: number): void {
    const pin = this.pins.get(role);
    if (!pin) return;
    this.placePin(role, pin.lngLat, radiusKm, pin.postcode);
  }

  /**
   * Get the currently placed pin for a role.
   */
  getPin(role: PinRole): PostcodePin | undefined {
    return this.pins.get(role);
  }

  /**
   * Get all placed pins.
   */
  getAllPins(): PostcodePin[] {
    return Array.from(this.pins.values());
  }

  isActive(): boolean {
    return this.activeRole !== null;
  }

  getActiveRole(): PinRole | null {
    return this.activeRole;
  }

  destroy(): void {
    this.disable();
    this.removeAll();
  }
}
