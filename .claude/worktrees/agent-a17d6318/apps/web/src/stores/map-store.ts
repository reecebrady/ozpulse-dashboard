import { create } from "zustand";
import type { MapPin, Alert } from "@ozpulse/shared";

// ── Viewport ────────────────────────────────────────────────────────────
export interface MapViewport {
  center: [number, number]; // [lng, lat]
  zoom: number;
  bearing: number;
  pitch: number;
}

// ── Drawn shapes (draw tool) ────────────────────────────────────────────
export type DrawnShapeType = "polygon" | "polyline" | "circle";

export interface DrawnShape {
  id: string;
  type: DrawnShapeType;
  /** GeoJSON coordinates — polygon ring, line coords, or [center, edge] for circle */
  coordinates: number[][] | number[][][];
  /** For circle shapes, radius in metres */
  radiusMetres?: number;
  /** Colour used to render on the map */
  color: string;
  label?: string;
  createdAt: string;
}

// ── Pinned locations ────────────────────────────────────────────────────
export interface PinnedLocation {
  label: string;
  lng: number;
  lat: number;
  postcode?: string;
}

export interface PinnedLocations {
  home: PinnedLocation | null;
  work: PinnedLocation | null;
  school: PinnedLocation | null;
}

// ── Detail panel data ───────────────────────────────────────────────────
export interface DetailPanelData {
  title: string;
  layerId: string;
  content: Record<string, unknown>;
}

// ── Selected feature (clicked map element) ──────────────────────────────
export interface SelectedFeature {
  id: string | number | undefined;
  layerId: string;
  properties: Record<string, unknown>;
  geometry: GeoJSON.Geometry;
  lngLat: [number, number];
}

// ── Store ───────────────────────────────────────────────────────────────
interface MapState {
  viewport: MapViewport;
  selectedFeature: SelectedFeature | null;
  detailPanel: DetailPanelData | null;
  drawnShapes: DrawnShape[];
  pinnedLocations: PinnedLocations;
  alerts: Alert[];
  sidebarOpen: boolean;

  // Viewport
  setViewport: (vp: Partial<MapViewport>) => void;

  // Feature selection
  setSelectedFeature: (f: SelectedFeature | null) => void;

  // Detail panel
  setDetailPanel: (data: DetailPanelData | null) => void;

  // Drawn shapes
  addDrawnShape: (shape: DrawnShape) => void;
  removeDrawnShape: (id: string) => void;
  clearDrawnShapes: () => void;

  // Pinned locations
  setPinnedLocation: (key: keyof PinnedLocations, loc: PinnedLocation | null) => void;

  // Alerts
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;

  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// Centre of Australia
const AUSTRALIA_CENTER: [number, number] = [133.7751, -25.2744];
const AUSTRALIA_ZOOM = 4;

export const useMapStore = create<MapState>((set) => ({
  viewport: {
    center: AUSTRALIA_CENTER,
    zoom: AUSTRALIA_ZOOM,
    bearing: 0,
    pitch: 0,
  },
  selectedFeature: null,
  detailPanel: null,
  drawnShapes: [],
  pinnedLocations: { home: null, work: null, school: null },
  alerts: [],
  sidebarOpen: true,

  // ── Viewport ────────────────────────────────────────────────────────
  setViewport: (vp) =>
    set((state) => ({ viewport: { ...state.viewport, ...vp } })),

  // ── Feature selection ───────────────────────────────────────────────
  setSelectedFeature: (f) => set({ selectedFeature: f }),

  // ── Detail panel ────────────────────────────────────────────────────
  setDetailPanel: (data) => set({ detailPanel: data }),

  // ── Drawn shapes ────────────────────────────────────────────────────
  addDrawnShape: (shape) =>
    set((state) => ({ drawnShapes: [...state.drawnShapes, shape] })),
  removeDrawnShape: (id) =>
    set((state) => ({
      drawnShapes: state.drawnShapes.filter((s) => s.id !== id),
    })),
  clearDrawnShapes: () => set({ drawnShapes: [] }),

  // ── Pinned locations ────────────────────────────────────────────────
  setPinnedLocation: (key, loc) =>
    set((state) => ({
      pinnedLocations: { ...state.pinnedLocations, [key]: loc },
    })),

  // ── Alerts ──────────────────────────────────────────────────────────
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, dismissed: true } : a
      ),
    })),
  clearAlerts: () => set({ alerts: [] }),

  // ── Sidebar ─────────────────────────────────────────────────────────
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
