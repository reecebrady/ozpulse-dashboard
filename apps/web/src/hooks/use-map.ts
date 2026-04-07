"use client";

import { createContext, useContext } from "react";
import type maplibregl from "maplibre-gl";

interface LayerManagerInterface {
  setMap(map: maplibregl.Map): void;
  show(id: string): void;
  hide(id: string): void;
  getAll(): Array<{ id: string; visible: boolean }>;
  destroy(): void;
}

interface MapContextValue {
  getMap: () => maplibregl.Map | null;
  getLayerManager: () => LayerManagerInterface | null;
  ready: boolean;
}

export const MapContext = createContext<MapContextValue>({
  getMap: () => null,
  getLayerManager: () => null,
  ready: false,
});

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapContext.Provider");
  }
  return context;
}
