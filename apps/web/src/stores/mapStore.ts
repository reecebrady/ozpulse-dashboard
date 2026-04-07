import { create } from "zustand";
import type { LayerId, MapLayer, Alert } from "@ozpulse/shared-types";

interface MapState {
  layers: Record<LayerId, MapLayer>;
  alerts: Alert[];
  selectedFeature: any | null;
  toggleLayer: (id: LayerId) => void;
  setSelectedFeature: (feature: any | null) => void;
  addAlert: (alert: Alert) => void;
  dismissAlert: (id: string) => void;
}

const defaultLayers: Record<string, MapLayer> = {
  "power-energy": { id: "power-energy", name: "Power & Energy", description: "", visible: false, opacity: 1, zIndex: 10 },
  "real-estate": { id: "real-estate", name: "Real Estate", description: "", visible: false, opacity: 1, zIndex: 20 },
  "crime-safety": { id: "crime-safety", name: "Crime & Safety", description: "", visible: false, opacity: 1, zIndex: 30 },
  "immigration-demographics": { id: "immigration-demographics", name: "Immigration & Demographics", description: "", visible: false, opacity: 1, zIndex: 40 },
  "infrastructure": { id: "infrastructure", name: "Infrastructure", description: "", visible: false, opacity: 1, zIndex: 50 },
  "mining-resources": { id: "mining-resources", name: "Mining & Resources", description: "", visible: false, opacity: 1, zIndex: 60 },
  "leisure-lifestyle": { id: "leisure-lifestyle", name: "Leisure & Lifestyle", description: "", visible: false, opacity: 1, zIndex: 70 },
};

export const useMapStore = create<MapState>((set) => ({
  layers: defaultLayers as Record<LayerId, MapLayer>,
  alerts: [],
  selectedFeature: null,
  toggleLayer: (id) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...state.layers[id], visible: !state.layers[id]?.visible },
      },
    })),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
  dismissAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));
