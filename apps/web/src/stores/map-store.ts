import { create } from "zustand";
import type { MapPin, Alert } from "@ozpulse/shared";

interface MapViewState {
  center: [number, number]; // [lng, lat]
  zoom: number;
}

interface DetailPanelData {
  title: string;
  layerId: string;
  content: Record<string, unknown>;
}

interface MapState {
  view: MapViewState;
  selectedPin: MapPin | null;
  detailPanel: DetailPanelData | null;
  alerts: Alert[];
  sidebarOpen: boolean;
  setView: (view: Partial<MapViewState>) => void;
  setSelectedPin: (pin: MapPin | null) => void;
  setDetailPanel: (data: DetailPanelData | null) => void;
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// Centre of Australia
const AUSTRALIA_CENTER: [number, number] = [133.7751, -25.2744];
const AUSTRALIA_ZOOM = 4;

export const useMapStore = create<MapState>((set) => ({
  view: { center: AUSTRALIA_CENTER, zoom: AUSTRALIA_ZOOM },
  selectedPin: null,
  detailPanel: null,
  alerts: [],
  sidebarOpen: true,
  setView: (view) =>
    set((state) => ({ view: { ...state.view, ...view } })),
  setSelectedPin: (pin) => set({ selectedPin: pin }),
  setDetailPanel: (data) => set({ detailPanel: data }),
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
    })),
  clearAlerts: () => set({ alerts: [] }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
