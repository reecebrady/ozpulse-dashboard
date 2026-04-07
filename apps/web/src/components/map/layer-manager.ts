/**
 * LayerManagerImpl -- manages MapLibre sources and layers with z-ordering.
 *
 * Other agents (or layer components) call `registerLayer()` to add their
 * sources + layers to the map. The manager handles z-ordering automatically:
 *   base map < heatmaps < fills (polygons) < lines < circles < symbols (labels)
 *
 * Source types supported: geojson, vector, raster, image
 * Layer types supported: circle, fill, fill-extrusion, line, heatmap, symbol, raster
 */

import type maplibregl from "maplibre-gl";

// --- Z-ordering constants ---
// Lower number = further back. Layers are inserted in order.
const Z_ORDER: Record<string, number> = {
  raster: 0,
  heatmap: 10,
  fill: 20,
  "fill-extrusion": 25,
  line: 30,
  circle: 40,
  symbol: 50,
};

function getZOrder(layerType: string): number {
  return Z_ORDER[layerType] ?? 35;
}

// --- Types ---

export interface LayerSourceDef {
  id: string;
  type: "geojson" | "vector" | "raster" | "image";
  data?: GeoJSON.GeoJSON | string; // GeoJSON object or URL for geojson type
  url?: string; // TileJSON URL for vector/raster
  tiles?: string[]; // Tile URL template(s)
  tileSize?: number;
  coordinates?: [[number, number], [number, number], [number, number], [number, number]]; // image corners
  maxzoom?: number;
  minzoom?: number;
  attribution?: string;
}

export interface LayerStyleDef {
  id: string;
  type: "circle" | "fill" | "fill-extrusion" | "line" | "heatmap" | "symbol" | "raster";
  source: string;
  "source-layer"?: string;
  filter?: unknown[];
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  minzoom?: number;
  maxzoom?: number;
  metadata?: Record<string, unknown>;
}

export interface RegisteredLayerGroup {
  id: string;
  sourceIds: string[];
  layerIds: string[];
  visible: boolean;
  zOrder: number; // derived from the highest-priority layer type in the group
}

export interface LayerManagerAPI {
  setMap(map: maplibregl.Map): void;
  registerLayer(
    groupId: string,
    sources: LayerSourceDef[],
    layers: LayerStyleDef[]
  ): void;
  toggleLayer(groupId: string, visible?: boolean): void;
  removeLayer(groupId: string): void;
  show(groupId: string): void;
  hide(groupId: string): void;
  isVisible(groupId: string): boolean;
  updateSource(sourceId: string, data: GeoJSON.GeoJSON): void;
  getAll(): RegisteredLayerGroup[];
  destroy(): void;
}

export class LayerManagerImpl implements LayerManagerAPI {
  private map: maplibregl.Map | null = null;
  private groups = new Map<string, RegisteredLayerGroup>();
  private pendingRegistrations: Array<{
    groupId: string;
    sources: LayerSourceDef[];
    layers: LayerStyleDef[];
  }> = [];

  setMap(map: maplibregl.Map): void {
    this.map = map;
    // Process any registrations that occurred before the map was ready
    for (const pending of this.pendingRegistrations) {
      this._addToMap(pending.groupId, pending.sources, pending.layers);
    }
    this.pendingRegistrations = [];
  }

  registerLayer(
    groupId: string,
    sources: LayerSourceDef[],
    layers: LayerStyleDef[]
  ): void {
    // If already registered, remove first
    if (this.groups.has(groupId)) {
      this.removeLayer(groupId);
    }

    if (!this.map) {
      // Queue for later when map is ready
      this.pendingRegistrations.push({ groupId, sources, layers });
      this.groups.set(groupId, {
        id: groupId,
        sourceIds: sources.map((s) => s.id),
        layerIds: layers.map((l) => l.id),
        visible: true,
        zOrder: Math.max(...layers.map((l) => getZOrder(l.type)), 0),
      });
      return;
    }

    this._addToMap(groupId, sources, layers);
  }

  private _addToMap(
    groupId: string,
    sources: LayerSourceDef[],
    layers: LayerStyleDef[]
  ): void {
    if (!this.map) return;

    // Add sources
    for (const src of sources) {
      if (this.map.getSource(src.id)) {
        // Source already exists, skip
        continue;
      }
      const sourceDef = this._buildSourceDef(src);
      this.map.addSource(src.id, sourceDef as maplibregl.SourceSpecification);
    }

    // Determine insertion point for z-ordering
    const sortedLayers = [...layers].sort(
      (a, b) => getZOrder(a.type) - getZOrder(b.type)
    );

    for (const layerDef of sortedLayers) {
      if (this.map.getLayer(layerDef.id)) {
        // Layer already exists, remove and re-add
        this.map.removeLayer(layerDef.id);
      }

      const beforeId = this._findInsertionPoint(getZOrder(layerDef.type));
      const mlLayer = this._buildLayerDef(layerDef);
      this.map.addLayer(mlLayer as maplibregl.LayerSpecification, beforeId);
    }

    this.groups.set(groupId, {
      id: groupId,
      sourceIds: sources.map((s) => s.id),
      layerIds: layers.map((l) => l.id),
      visible: true,
      zOrder: Math.max(...layers.map((l) => getZOrder(l.type)), 0),
    });
  }

  /**
   * Find the ID of the first existing layer with a higher z-order,
   * so our new layer gets inserted before it (i.e., rendered below it).
   */
  private _findInsertionPoint(zOrder: number): string | undefined {
    if (!this.map) return undefined;
    const style = this.map.getStyle();
    if (!style?.layers) return undefined;

    // Walk existing layers and find the first one from our managed set
    // that has a higher z-order
    const managedLayerIds = new Set<string>();
    for (const group of this.groups.values()) {
      for (const lid of group.layerIds) managedLayerIds.add(lid);
    }

    for (const existingLayer of style.layers) {
      if (!managedLayerIds.has(existingLayer.id)) continue;
      const existingZ = getZOrder(existingLayer.type);
      if (existingZ > zOrder) {
        return existingLayer.id;
      }
    }
    return undefined;
  }

  private _buildSourceDef(src: LayerSourceDef): Record<string, unknown> {
    switch (src.type) {
      case "geojson":
        return {
          type: "geojson",
          data: src.data ?? { type: "FeatureCollection", features: [] },
          ...(src.maxzoom != null && { maxzoom: src.maxzoom }),
          ...(src.attribution && { attribution: src.attribution }),
        };
      case "vector":
        return {
          type: "vector",
          ...(src.url ? { url: src.url } : {}),
          ...(src.tiles ? { tiles: src.tiles } : {}),
          ...(src.maxzoom != null && { maxzoom: src.maxzoom }),
          ...(src.minzoom != null && { minzoom: src.minzoom }),
          ...(src.attribution && { attribution: src.attribution }),
        };
      case "raster":
        return {
          type: "raster",
          ...(src.url ? { url: src.url } : {}),
          ...(src.tiles ? { tiles: src.tiles } : {}),
          tileSize: src.tileSize ?? 256,
          ...(src.maxzoom != null && { maxzoom: src.maxzoom }),
          ...(src.minzoom != null && { minzoom: src.minzoom }),
          ...(src.attribution && { attribution: src.attribution }),
        };
      case "image":
        return {
          type: "image",
          url: src.url ?? "",
          coordinates: src.coordinates ?? [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
        };
      default:
        return { type: "geojson", data: { type: "FeatureCollection", features: [] } };
    }
  }

  private _buildLayerDef(def: LayerStyleDef): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: def.id,
      type: def.type,
      source: def.source,
    };
    if (def["source-layer"]) result["source-layer"] = def["source-layer"];
    if (def.filter) result.filter = def.filter;
    if (def.paint) result.paint = def.paint;
    if (def.layout) result.layout = def.layout;
    if (def.minzoom != null) result.minzoom = def.minzoom;
    if (def.maxzoom != null) result.maxzoom = def.maxzoom;
    if (def.metadata) result.metadata = def.metadata;
    return result;
  }

  toggleLayer(groupId: string, visible?: boolean): void {
    const group = this.groups.get(groupId);
    if (!group) return;
    const newVisible = visible ?? !group.visible;
    if (newVisible) {
      this.show(groupId);
    } else {
      this.hide(groupId);
    }
  }

  show(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group || !this.map) return;
    group.visible = true;
    for (const layerId of group.layerIds) {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, "visibility", "visible");
      }
    }
  }

  hide(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group || !this.map) return;
    group.visible = false;
    for (const layerId of group.layerIds) {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, "visibility", "none");
      }
    }
  }

  removeLayer(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    if (this.map) {
      // Remove layers first, then sources
      for (const layerId of group.layerIds) {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      }
      for (const sourceId of group.sourceIds) {
        // Only remove source if no other group references it
        const otherGroups = Array.from(this.groups.values()).filter(
          (g) => g.id !== groupId && g.sourceIds.includes(sourceId)
        );
        if (otherGroups.length === 0 && this.map.getSource(sourceId)) {
          this.map.removeSource(sourceId);
        }
      }
    }

    this.groups.delete(groupId);
  }

  isVisible(groupId: string): boolean {
    return this.groups.get(groupId)?.visible ?? false;
  }

  updateSource(sourceId: string, data: GeoJSON.GeoJSON): void {
    if (!this.map) return;
    const source = this.map.getSource(sourceId);
    if (source && "setData" in source) {
      (source as maplibregl.GeoJSONSource).setData(data);
    }
  }

  getAll(): RegisteredLayerGroup[] {
    return Array.from(this.groups.values());
  }

  destroy(): void {
    if (!this.map) return;
    for (const groupId of Array.from(this.groups.keys())) {
      this.removeLayer(groupId);
    }
    this.map = null;
  }
}
